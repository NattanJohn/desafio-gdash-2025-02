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
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS', 'guest')
QUEUE_NAME = 'weather_logs_queue'

# Configurações de Localização (Matinhos - PR)
LATITUDE = -25.8194
LONGITUDE = -48.5422
CITY = "Matinhos"
COUNTRY = "Brazil"
STATE = "PR"

def get_weather_data():
    """
    Busca dados de clima (Atual + Previsão) na API Open-Meteo.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        # Dados atuais
        "current": "temperature_2m,relative_humidity_2m,is_day,weather_code",
        # Dados de previsão horária (para calcularmos a chance de chuva futura)
        "hourly": "precipitation_probability,weather_code",
        "forecast_days": 1,
        "timezone": "auto"
    }
    
    try:
        logger.info(f"Buscando clima e previsão para {CITY}...")
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status() 
        data = response.json()
        
        current = data.get('current', {})
        hourly = data.get('hourly', {})
        
        # --- Lógica de "Pré-IA" no Python ---
        # Vamos pegar a probabilidade MÁXIMA de chuva nas próximas 6 horas
        current_hour_index = datetime.now().hour
        # Fatia as próximas 6 horas (garantindo que não estoure o array)
        next_6h_probs = hourly.get('precipitation_probability', [])[current_hour_index : current_hour_index + 6]
        
        # Se a lista estiver vazia (fim do dia), pega o que tem
        max_rain_prob = max(next_6h_probs) if next_6h_probs else 0

        weather_log = {
            "city": CITY,
            "country": COUNTRY,
            "temperature": current.get('temperature_2m'),
            "humidity": current.get('relative_humidity_2m'),
            "weatherCode": current.get('weather_code'), # Código WMO (0=Céu limpo, 99=Tempestade)
            "rainProbability": max_rain_prob, # Nova métrica preditiva
            "isDay": current.get('is_day'),
            "timestamp": datetime.now().isoformat() 
        }
        return weather_log

    except Exception as e:
        logger.error(f"Erro ao buscar na API: {e}")
        return None

def publish_to_queue(data):
    if not data: return

    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)

    connection = None
    try:
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        channel.queue_declare(queue=QUEUE_NAME, durable=False)

        message_body = json.dumps(data) 

        channel.basic_publish(exchange='', routing_key=QUEUE_NAME, body=message_body)
        
        logger.info(f"✅ Enviado: {data['city']} | Temp: {data['temperature']}°C | Chuva (6h): {data['rainProbability']}%")

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
    logger.info("🚀 Coletor Iniciado (Modo Preditivo)...")
    job() 
    schedule.every(1).minute.do(job) 
    while True:
        schedule.run_pending()
        time.sleep(1)