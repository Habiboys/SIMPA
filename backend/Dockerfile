# Gunakan image resmi Node.js
FROM node:22

# Set direktori kerja di dalam container
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json
COPY be/package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh aplikasi
COPY . .

# Build aplikasi
RUN npm run build

# Expose port
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "run", "start:prod"]
