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
func consumeAndProcess(ch *amqp.Channel, msgs <-chan amqp.Delivery, nestjsURL string) {
	for d := range msgs {
		log.Printf("[Worker] Mensagem recebida da fila: %s", d.Body)

		var msgData WeatherLogMessage
		if err := json.Unmarshal(d.Body, &msgData); err != nil {
			log.Printf("[ERRO] Falha ao decodificar JSON: %v. Rejeitando mensagem (ACK=false).", err)
			d.Nack(false, false)
			continue
		}

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

		// Envio com retry
		err := sendToNestJSWithRetry(payload, nestjsURL)

		if err != nil {
			log.Printf("[ERRO FATAL] Falha persistente ao enviar para NestJS: %v. Rejeitando mensagem.", err)
			d.Nack(false, false)
			continue
		}

		d.Ack(false)
		log.Printf("[SUCESSO] Log enviado para NestJS e ACK confirmado.")
	}
}

// Envia o payload com no máximo MaxRetries tentativas
func sendToNestJSWithRetry(payload CreateWeatherLogDto, url string) error {
	jsonPayload, _ := json.Marshal(payload)

	for i := 0; i < MaxRetries; i++ {
		req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
		if err != nil {
			return fmt.Errorf("erro ao criar requisição: %w", err)
		}

		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{Timeout: 15 * time.Second}
		resp, err := client.Do(req)

		if err == nil && resp.StatusCode == http.StatusCreated {
			resp.Body.Close()
			return nil
		}

		if resp != nil {
			resp.Body.Close()
			log.Printf("[RETRY] Tentativa %d/%d falhou com status %d (%s)",
				i+1, MaxRetries, resp.StatusCode, url)
		} else {
			log.Printf("[RETRY] Tentativa %d/%d falhou: %v (%s)",
				i+1, MaxRetries, err, url)
		}

		time.Sleep(time.Duration(i*i+1) * time.Second)
	}

	return fmt.Errorf("falha ao enviar para NestJS após %d tentativas", MaxRetries)
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("[ALERTA] Não foi possível carregar arquivo .env")
	}

	// Configs
	user := os.Getenv("RABBITMQ_USER")
	pass := os.Getenv("RABBITMQ_PASS")
	host := os.Getenv("RABBITMQ_HOST")
	port := os.Getenv("RABBITMQ_PORT")
	rabbitmqURL := fmt.Sprintf("amqp://%s:%s@%s:%s/", user, pass, host, port)

	nestjsHost := os.Getenv("NESTJS_HOST")
	nestjsPort := os.Getenv("NESTJS_PORT")

	nestjsURL := fmt.Sprintf("http://%s:%s/weather-logs", nestjsHost, nestjsPort)

	if host == "" || nestjsHost == "" {
		log.Fatal("RABBITMQ_HOST ou NESTJS_HOST não configurado no .env")
	}

	// Conexão RabbitMQ
	conn, err := amqp.Dial(rabbitmqURL)
	failOnError(err, "Falha ao conectar ao RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir canal")
	defer ch.Close()

	// Declara fila
	q, err := ch.QueueDeclare(
		QueueName,
		false,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Falha ao declarar fila")

	// QoS
	err = ch.Qos(1, 0, false)
	failOnError(err, "Falha ao definir QoS")

	// Consome fila
	msgs, err := ch.Consume(
		q.Name,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Falha ao registrar consumidor")

	forever := make(chan bool)

	log.Printf(" [*] Worker iniciado. Enviando para: %s | Fila: %s | CTRL+C para sair",
		nestjsURL, q.Name)

	go consumeAndProcess(ch, msgs, nestjsURL)

	<-forever
}
