# Estágio de Build
FROM node:20-alpine AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de definição de dependência
COPY package*.json ./

# Instala as dependências de produção (e de desenvolvimento, se necessário para o build)
RUN npm install

# Copia o restante do código da aplicação
COPY . .

# Faz o build da aplicação NestJS
RUN npm run build

# --- Estágio de Produção (Runtime) ---
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas o que é necessário do estágio de build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json .

# Copia o .env (importante para que o NestJS encontre as variáveis)
# O NestJS está configurado para ler o .env nesta pasta.
COPY .env .

# Expõe a porta que o NestJS está rodando
EXPOSE 3000

# Comando para iniciar o servidor NestJS
CMD ["node", "dist/main"]