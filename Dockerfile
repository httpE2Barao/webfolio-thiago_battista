# Dockerfile

# 1. Use uma imagem base do Node.js leve
FROM node:20-alpine AS base

# 2. Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# 3. Copie os arquivos de dependência e instale-as
COPY package*.json ./
RUN npm install

# 4. Copie o restante do código da aplicação
COPY . .

# 5. Exponha a porta que a aplicação Next.js usa
EXPOSE 3000

# 6. Defina o comando para iniciar o servidor de desenvolvimento
CMD ["npm", "run", "build"]