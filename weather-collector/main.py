import os
import time
import json
import logging
import requests
import pika
import schedule
from datetime import datetime

# Configuração básica de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("WeatherCollector")

# Configurações do RabbitMQ
RABBITMQ_HOST = 'localhost' 
RABBITMQ_PORT = 5672
RABBITMQ_USER = 'guest' 
RABBITMQ_PASS = 'guest' 
QUEUE_NAME = 'weather_logs_queue'

# Configurações de Localização
LATITUDE = -25.8194
LONGITUDE = -48.5422
CITY = "Matinhos"
COUNTRY = "Brazil"
STATE = "PR"

def get_weather_data():
    """
    Busca dados de clima em tempo real na API Open-Meteo.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "current": "temperature_2m,relative_humidity_2m",
        "timezone": "auto"
    }
    
    try:
        logger.info(f"Buscando clima para {CITY}-{STATE} ({LATITUDE}, {LONGITUDE})...")
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status() 
        data = response.json()
        
        current = data.get('current', {})
        
        # 1. Cria o payload JSON puro que o Worker Go espera
        weather_log = {
            "city": CITY,
            "country": COUNTRY,
            "temperature": current.get('temperature_2m'),
            "humidity": current.get('relative_humidity_2m'),
            "timestamp": datetime.now().isoformat() 
        }
        return weather_log

    except Exception as e:
        logger.error(f"Erro ao buscar na API: {e}")
        return None

def publish_to_queue(data):
    """
    Publica os dados de clima na fila RabbitMQ.
    """
    if not data:
        return

    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        port=RABBITMQ_PORT,
        credentials=credentials
    )

    connection = None
    try:
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        channel.queue_declare(queue=QUEUE_NAME, durable=False)

        # 🚨 CORREÇÃO CRÍTICA: Remove o envelope {"pattern": "create_log", "data": data}
        # O Worker Go espera o JSON puro: {"city": "...", "temperature": ...}
        message_body = json.dumps(data) 

        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_NAME,
            body=message_body # Publica o JSON puro
        )
        
        logger.info(f"✅ Enviado para fila RabbitMQ: Temp {data['temperature']}°C em {CITY}")

    except Exception as e:
        logger.error(f"❌ Erro no RabbitMQ: {e}")
    finally:
        if connection and connection.is_open:
            connection.close()

def job():
    """
    Função principal que executa a coleta e publicação.
    """
    weather_data = get_weather_data()
    if weather_data:
        publish_to_queue(weather_data)

if __name__ == "__main__":
    logger.info("🚀 Iniciando Robô Coletor de Clima...")
    # Executa a primeira vez imediatamente
    job() 
    # Agenda a execução a cada 1 hora
    schedule.every(1).hour.do(job) 
    
    # Loop de execução de agendamentos
    while True:
        schedule.run_pending()
        time.sleep(1)