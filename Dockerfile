FROM node:18-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "chmod +x start.sh && ./start.sh"]
