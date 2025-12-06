# 🚀 GDASH 2025/02 - Desafio Full-Stack Nattan John

Este repositório contém a solução desenvolvida para o Desafio Full-Stack do processo seletivo GDASH 2025/02, focada na construção de um sistema de monitoramento climático distribuído, com análise de dados em tempo real e insights gerados por IA.

## 💡 Sobre a Solução

A solução implementa uma arquitetura de microsserviços e mensageria (event-driven) para garantir escalabilidade, resiliência e alta disponibilidade. O foco principal é no pipeline de dados, desde a coleta periódica de informações climáticas até a persistência no banco de dados e a exibição final em um dashboard moderno.

## 🌐 Arquitetura e Fluxo de Dados

A aplicação é composta por seis serviços que se comunicam via rede interna (Docker Compose) e através de uma fila de mensagens centralizada (RabbitMQ).

O Fluxo de Dados Completo (Python → Go → NestJS → React):

1.  **Coleta (Python `weather_collector`):** Um script Python busca, a cada 1 minuto (configurado para testes rápidos), os dados climáticos atuais e previsões na Open-Meteo. Os dados são normalizados e publicados como uma mensagem JSON na fila RabbitMQ.
    
2.  **Mensageria (RabbitMQ):** Atua como o Message Broker, garantindo que as mensagens de clima sejam armazenadas de forma durável até que o Worker Go esteja pronto para processá-las.
    
3.  **Processamento (Go `weather_worker`):** Um Worker implementado em Go consome as mensagens da fila. Após validação, ele envia o registro final via HTTP POST para o endpoint da API NestJS.
    
4.  **Persistência (NestJS API):** O NestJS, como núcleo do sistema, recebe o log do Go Worker e o armazena no MongoDB. Ele é responsável por expor todos os endpoints (Dados, Auth, CRUD de Usuários e Insights de IA).
    
5.  **Apresentação (React Frontend):** O front-end consome a API NestJS, exibindo os dados em tempo real no Dashboard.
    

## 🛠️ Stack Tecnológica

| Componente | Tecnologia | Detalhes |
| --- | --- | --- |
| **Frontend** | React + Vite + TypeScript | Interface moderna e responsiva. |
| **Estilização/UI** | Tailwind CSS + shadcn/ui | Design system robusto e acessível. |
| **Backend (API)** | NestJS + TypeScript | Core da aplicação, lógica de negócio, persistência e autenticação. |
| **Coleta de Dados** | Python | Worker de coleta agendada (Scheduler) usando a API Open-Meteo. |
| **Fila/Worker** | Go + RabbitMQ | Worker de alta performance para consumo e processamento de mensagens. |
| **Banco de Dados** | MongoDB | Persistência dos logs de clima e dados de usuário. |
| **Infraestrutura** | Docker / Docker Compose | Orquestração de todos os serviços em um único ambiente. |
| **API Externa** | SpaceX API | Integração paginada para a tela de exploração (`external-api`). |

## ⚙️ Configuração e Execução

Todo o sistema é projetado para ser inicializado com um único comando Docker Compose.

### 1\. Pré-requisitos

Certifique-se de ter instalado em sua máquina:

-   Docker e Docker Compose
    
-   Git
    

### 2\. Variáveis de Ambiente (Configuração Multisserviço)

Para o ambiente de desenvolvimento local (Docker Compose), o projeto exige arquivos de ambiente separados em diferentes diretórios.

**Passo 1: Arquivo de Exemplo**

O arquivo **`.env.example`** na raiz do projeto contém todas as variáveis necessárias e deve ser consultado como gabarito.

**Passo 2: Criação dos Arquivos `.env`**

Você **deve** criar um arquivo `.env` em cada um dos seguintes diretórios, copiando apenas as variáveis relevantes para aquele serviço.

| Pasta | Arquivo Criado | Variáveis Chave Necessárias (Exemplo) |
| --- | --- | --- |
| **Raiz** | `/.env` | `MONGO_USER`, `MONGO_PASS`, `RABBITMQ_USER`, `RABBITMQ_PASS` |
| **`backend/`** | `backend/.env` | `MONGO_URI`, `RABBITMQ_URI`, `JWT_SECRET`, `DEFAULT_USER_EMAIL`, `DEFAULT_USER_PASS` |
| **`frontend/`** | `frontend/.env` | `VITE_API_BASE_URL` |
| **`weather-worker/`** | `weather-worker/.env` | `RABBITMQ_URI`, `NESTJS_INTERNAL_URL` |
| **`weather-collector/`** | `weather-collector/.env` | `RABBITMQ_URI`, `WEATHER_API_KEY`, `WEATHER_LAT`, `WEATHER_LON`, `NESTJS_INTERNAL_URL` |

> **IMPORTANTE:** Para o ambiente Docker Compose, use os nomes dos serviços como hosts:
> 
> -   **`MONGO_URI`** e **`RABBITMQ_URI`**: Devem apontar para `mongodb://mongo:...` e `amqp://rabbitmq:...` respectivamente.
>     
> -   **`NESTJS_INTERNAL_URL`**: Deve ser `http://backend:3000` (o nome do serviço Docker).
>     

### 3\. Execução

Siga os passos abaixo para subir toda a arquitetura:

1.  Clone o repositório:
    
        git clone [LINK_DO_SEU_REPOSITÓRIO]
        cd [pasta-do-projeto]
        
    
2.  Construa e Inicie os Contêineres: Este comando irá construir todas as imagens (Backend, Frontend, Go Worker, Python Collector) e iniciar os seis serviços:
    
        docker-compose up --build -d
        
    
3.  Verificação dos Logs: Verifique os logs para confirmar que o `weather_collector` (Python) está publicando e que o `weather_worker` (Go) está consumindo e persistindo:
    
        # Logs do Coletor Python (publica a cada 1 minuto(Para testes))
        docker-compose logs -f weather_collector
        
        # Logs do Worker Go (consome a fila)
        docker-compose logs -f weather_worker
        
    

### 4\. Acessos Principais

| Serviço | URL de Acesso | Porta |
| --- | --- | --- |
| **Frontend (Dashboard)** | `http://localhost:8080` | `8080` |
| **API NestJS** | `http://localhost:3000` | `3000` |
| **RabbitMQ Admin** | `http://localhost:15672` | `15672` |

## 🔒 Acesso Inicial ao Dashboard

A aplicação possui um sistema de autenticação JWT e um usuário padrão é criado automaticamente na inicialização do serviço backend.

| Campo | Valor |
| --- | --- |
| E-mail | `admin@email.com` |
| Senha | `123456` |

## 📋 Escopo Funcional Implementado

### 🌦️ Dashboard de Clima & Insights de IA

-   **Dashboard principal:** Exibe os dados climáticos mais recentes (Temperatura, Umidade, Código do Tempo, Probabilidade de Chuva Máxima em 6h).
    
-   **Insights de IA:** Um endpoint no backend (NestJS) analisa os dados de temperatura e umidade para calcular um Índice de Conforto Climático (CCI) e gera uma classificação em texto (ex: "Clima Agradável", "Alerta de Calor Moderado").
    

### 👤 Usuários e Autenticação

-   **Autenticação JWT:** Rotas protegidas no NestJS.
    
-   **Login:** Tela de login funcional, utilizando as credenciais padrão.
    
-   **CRUD de Usuários:** Implementado no backend (NestJS) e acessível no frontend para listagem, criação, edição e exclusão de usuários.
    

### 💾 Exportação de Dados

-   **Endpoints de Exportação:** A API NestJS expõe rotas para exportação de `weather_logs`.
    
-   **Formatos:** Suporte a exportação em CSV (via `GET /api/weather/export/csv`) e XLSX (via `GET /api/weather/export/xlsx`).
    

### 🚀 Integração Opcional (SpaceX API)

-   **Página `/explore`:** Consome a API pública da SpaceX (Launches) através de um endpoint no backend (NestJS), garantindo paginação, conforme solicitado.
    

## ✅ Checklist de Entrega

| Requisito | Status | Observações |
| --- | --- | --- |
| Python coleta dados de clima (Open-Meteo) | ✅ | Coleta dados atuais e previsão de probabilidade de chuva. |
| Python envia dados para a fila | ✅ | Publica mensagens JSON no RabbitMQ (`weather_logs_queue`). |
| Worker Go consome a fila e envia para a API NestJS | ✅ | Worker Go processa e envia para `POST /api/weather/logs`. |
| API NestJS: Armazena logs de clima em MongoDB | ✅ | Logs armazenados na coleção `weather_logs`. |
| API NestJS: Exponde endpoints para listar dados | ✅ | `GET /api/weather/logs`. |
| API NestJS: Gera/retorna insights de IA (endpoint próprio) | ✅ | Insights gerados com base no CCI (Climate Comfort Index). |
| API NestJS: Exporta dados em CSV/XLSX | ✅ | Endpoints de exportação implementados. |
| API NestJS: Implementa CRUD de usuários + autenticação | ✅ | CRUD completo e autenticação JWT. |
| (Opcional) Integração com API pública paginada | ✅ | Integração com a SpaceX API. |
| Frontend React + Vite + Tailwind + shadcn/ui: Dashboard de clima com dados reais | ✅ | Dashboard funcional, exibindo os dados mais recentes. |
| Exibição de insights de IA | ✅ | Insights de classificação de clima exibidos. |
| CRUD de usuários + login | ✅ | Telas de Login e CRUD de Usuários implementadas. |
| (Opcional) Página consumindo API pública paginada | ✅ | Página `external-apie` com listagem e paginação. |
| Docker Compose sobe todos os serviços | ✅ | 6 serviços inicializados via `docker-compose up`. |
| Código em TypeScript (backend e frontend) | ✅ | Linguagem base obrigatória respeitada. |
| Logs e tratamento de erros básicos em cada serviço | ✅ | Implementado em todas as camadas. |
