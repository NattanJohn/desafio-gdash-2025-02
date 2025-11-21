package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/streadway/amqp"
)

// Estrutura dos dados que vêm da fila (do Python)
type WeatherLogMessage struct {
	City        string  `json:"city"`
	Country     string  `json:"country"`
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	Timestamp   string  `json:"timestamp"` 
}

// Estrutura dos dados a serem enviados para a API NestJS (POST /weather-logs)
type CreateWeatherLogDto struct {
	City        string  `json:"city"`
	Country     string  `json:"country"`
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
}

const (
	MaxRetries = 3
	QueueName  = "weather_logs_queue"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %v", msg, err)
	}
}

// Consome mensagens da fila, valida e envia para a API NestJS
func consumeAndProcess(ch *amqp.Channel, msgs <-chan amqp.Delivery, nestjsURL string, nestjsToken string) {
	for d := range msgs {
		log.Printf("[Worker] Mensagem recebida da fila: %s", d.Body)

		var msgData WeatherLogMessage
		if err := json.Unmarshal(d.Body, &msgData); err != nil {
			log.Printf("[ERRO] Falha ao decodificar JSON: %v. Rejeitando mensagem (ACK=false).", err)
			d.Nack(false, false) // Rejeita e não re-enfileira
			continue
		}

		// 1. Transforma e Valida os Dados
		if msgData.City == "" || msgData.Temperature == 0 {
			log.Printf("[ALERTA] Dados inválidos/incompletos: %+v. Rejeitando.", msgData)
			d.Nack(false, false)
			continue
		}

		payload := CreateWeatherLogDto{
			City:        msgData.City,
			Country:     msgData.Country,
			Temperature: msgData.Temperature,
			Humidity:    msgData.Humidity,
		}

		// 2. Envio HTTP com Retry
		err := sendToNestJSWithRetry(payload, nestjsURL, nestjsToken)

		if err != nil {
			// Se falhar após as tentativas, registra o erro e rejeita
			log.Printf("[ERRO FATAL] Falha persistente ao enviar para NestJS: %v. Rejeitando mensagem (ACK=false).", err)
			d.Nack(false, false)
			continue
		}

		// 3. Confirmação (ACK)
		d.Ack(false)
		log.Printf("[SUCESSO] Log de clima enviado para NestJS e mensagem confirmada (ACK).")
	}
}

// Tenta enviar o payload para o NestJS com no máximo MaxRetries tentativas.
func sendToNestJSWithRetry(payload CreateWeatherLogDto, url string, token string) error {
	jsonPayload, _ := json.Marshal(payload)
	
	for i := 0; i < MaxRetries; i++ {
		req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
		if err != nil {
			return fmt.Errorf("erro ao criar requisição: %w", err)
		}
		
		req.Header.Set("Content-Type", "application/json")
		if token != "" {
			// Adiciona o cabeçalho de Autorização se o token estiver presente
			req.Header.Set("Authorization", "Bearer "+token)
		}

		client := &http.Client{Timeout: 15 * time.Second}
		resp, err := client.Do(req)
		
		if err == nil && resp.StatusCode == http.StatusCreated {
			// Sucesso (Status 201 Created)
			resp.Body.Close()
			return nil 
		}

		if resp != nil {
			resp.Body.Close()
			log.Printf("[RETRY] Tentativa %d/%d falhou com status %d. URL: %s", i+1, MaxRetries, resp.StatusCode, url)
		} else {
			log.Printf("[RETRY] Tentativa %d/%d falhou: %v. URL: %s", i+1, MaxRetries, err, url)
		}
		
		// Espera exponencial (1s, 4s, 9s...) antes da próxima tentativa
		time.Sleep(time.Duration(i*i+1) * time.Second)
	}
	
	return fmt.Errorf("falha ao enviar para NestJS após %d tentativas", MaxRetries)
}

func main() {
	// Carrega variáveis de ambiente do .env
	if err := godotenv.Load(); err != nil {
		log.Println("[ALERTA] Não foi possível carregar arquivo .env")
	}

	// 1. Configurações de Conexão
	user := os.Getenv("RABBITMQ_USER")
	pass := os.Getenv("RABBITMQ_PASS")
	host := os.Getenv("RABBITMQ_HOST")
	port := os.Getenv("RABBITMQ_PORT")
	rabbitmqURL := fmt.Sprintf("amqp://%s:%s@%s:%s/", user, pass, host, port)
	
	nestjsHost := os.Getenv("NESTJS_HOST")
	nestjsPort := os.Getenv("NESTJS_PORT")
	nestjsToken := os.Getenv("NESTJS_WORKER_TOKEN") 

	nestjsURL := fmt.Sprintf("http://%s:%s/weather-logs", nestjsHost, nestjsPort)

	if host == "" || nestjsHost == "" {
		log.Fatal("RABBITMQ_HOST ou NESTJS_HOST não configurado no .env")
	}

	// 2. Conexão RabbitMQ
	conn, err := amqp.Dial(rabbitmqURL)
	failOnError(err, "Falha ao conectar ao RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir um canal")
	defer ch.Close()

	// Declaração da fila (importante para garantir que ela exista)
	q, err := ch.QueueDeclare(
		QueueName, // name
		false,     // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	failOnError(err, "Falha ao declarar a fila")

	// 3. Define a política de pré-busca (QoS)
	err = ch.Qos(
		1,     // prefetch count (processa 1 mensagem por vez)
		0,     // prefetch size
		false, // global
	)
	failOnError(err, "Falha ao definir QoS")

	// 4. Inicia o consumo da fila (auto-ack=false é obrigatório para controle manual)
	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack (desligado para usarmos d.Ack ou d.Nack)
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Falha ao registrar o consumidor")

	forever := make(chan bool)

	log.Printf(" [*] Worker Go iniciado. Enviando para: %s. Aguardando mensagens em %s. Para sair, pressione CTRL+C", nestjsURL, q.Name)
	go consumeAndProcess(ch, msgs, nestjsURL, nestjsToken)

	// Mantém o worker rodando
	<-forever
}