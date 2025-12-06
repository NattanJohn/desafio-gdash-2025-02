FROM golang:alpine AS builder

# Instala dependências do sistema necessárias para o build (git é frequentemente necessário)
RUN apk add --no-cache git

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de código-fonte
COPY . .

# Faz o download das dependências (go.mod e go.sum)
RUN go mod tidy

# Compila a aplicação Go de forma estática (melhor para containers)
RUN CGO_ENABLED=0 GOOS=linux go build -o weather-worker main.go

# --- Estágio de Produção (Runtime) ---
FROM alpine:latest

# Define o diretório de trabalho
WORKDIR /root/

# Copia o binário e o .env do estágio de build
COPY --from=builder /app/weather-worker .
# O .env é copiado, mas lembre-se que variáveis do docker-compose sobrescrevem
COPY --from=builder /app/.env .

# Comando para rodar o Worker Go
CMD ["./weather-worker"]