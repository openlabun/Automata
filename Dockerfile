# Usa una imagen base de Node.js
FROM node:18-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json (o yarn.lock) primero
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Instalar dependencias
RUN npm install --frozen-lockfile 

# Copiar el código fuente
COPY . .

# Exponer el puerto en el que correrá Next.js
EXPOSE 3000

# Comando para iniciar la aplicación en producción
CMD ["npm", "run", "dev"]
