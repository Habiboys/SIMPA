# Gunakan Node.js versi 22
FROM node:22-alpine

# Tentukan direktori kerja di dalam kontainer
WORKDIR /app

# Salin package.json dan package-lock.json (atau yarn.lock) ke kontainer
COPY package*.json ./

# Instal dependensi
RUN npm install

# Salin sisa kode aplikasi ke dalam kontainer
COPY frontend .

# Bangun aplikasi React untuk produksi
RUN npm run build

# Gunakan nginx untuk menyajikan aplikasi React
FROM nginx:alpine

# Salin build React ke direktori nginx
COPY --from=0 /app/dist /usr/share/nginx/html

# Ekspos port yang digunakan oleh nginx
EXPOSE 80

# Jalankan nginx
CMD ["nginx", "-g", "daemon off;"]
