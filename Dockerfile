# Etapa de build
FROM node:20 AS builder

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./
RUN npm ci

# Copia o restante do código
COPY . .

# Build da aplicação Nest
RUN npm run build

# Etapa de runtime (imagem menor)
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copia apenas o necessário
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/main.js"]
