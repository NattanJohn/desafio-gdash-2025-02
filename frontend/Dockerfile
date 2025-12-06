# Estágio de Build (Instalar dependências e construir o bundle)
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o código-fonte
COPY . .

# Faz o build do frontend (gera a pasta dist)
RUN npm run build

# --- Estágio de Produção (Runtime com Nginx) ---
FROM nginx:alpine

# Copia os arquivos estáticos de build do estágio 'builder' para o servidor Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80, que será mapeada para uma porta no host (por exemplo, 8080)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]