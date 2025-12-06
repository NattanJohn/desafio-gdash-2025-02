FROM python:3.11-slim

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copiar os arquivos de dependências e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante do código da aplicação
COPY . .

# Comando para rodar o script principal
# O parâmetro -u garante que o output do Python não seja bufferizado, 
# o que permite vermos os logs em tempo real (docker-compose logs)
CMD ["python", "-u", "main.py"]