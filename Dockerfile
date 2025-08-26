# Imagen base de Node.js
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

COPY .env .env

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias ignorando conflictos de peer dependencies
RUN npm install --legacy-peer-deps

# Copia el resto del proyecto
COPY . .

# Expone el puerto 3000 (donde corre create-react-app por defecto)
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "start"]
