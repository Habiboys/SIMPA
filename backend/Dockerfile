# Dockerfile untuk backend
FROM node:22

# Set direktori kerja di dalam container
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json dari folder backend
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh aplikasi backend
COPY backend/ .

# Expose port
EXPOSE 3000

# Jalankan aplikasi backend
CMD ["npm", "run", "start"]
