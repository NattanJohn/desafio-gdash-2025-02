import os
import time
import json
import logging
import requests
import pika
import schedule
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("WeatherCollector")

RABBITMQ_HOST = 'localhost' 
RABBITMQ_PORT = 5672
RABBITMQ_USER = 'guest' 
RABBITMQ_PASS = 'guest' 
QUEUE_NAME = 'weather_logs_queue'

LATITUDE = -25.8194
LONGITUDE = -48.5422
CITY = "Matinhos"
COUNTRY = "Brazil"
STATE = "PR"

def get_weather_data():
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
        message_payload = {
            "pattern": "create_log", 
            "data": data
        }

        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_NAME,
            body=json.dumps(message_payload)
        )
        
        logger.info(f"✅ Enviado para fila RabbitMQ: Temp {data['temperature']}°C em {CITY}")

    except Exception as e:
        logger.error(f"❌ Erro no RabbitMQ: {e}")
    finally:
        if connection and connection.is_open:
            connection.close()

def job():
    weather_data = get_weather_data()
    if weather_data:
        publish_to_queue(weather_data)
if __name__ == "__main__":
    logger.info("🚀 Iniciando Robô Coletor de Clima...")
    job()
    schedule.every(1).hour.do(job)
    while True:
        schedule.run_pending()
        time.sleep(1)