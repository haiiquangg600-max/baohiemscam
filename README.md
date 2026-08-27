# BaoHiemScam

React + Vite + Express + **Neon Postgres** + **Cloudinary**

## Admin
- user: `adminbhsc`
- pass: `phanhaiquang` (qua env)

## Render Environment (bắt buộc)

```
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_USERNAME=adminbhsc
ADMIN_PASSWORD=phanhaiquang
JWT_SECRET=chuoi-bi-mat-dai
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
PUBLIC_URL=https://your-api.onrender.com
```

## Sau deploy
Mở 1 lần: `https://API/api/setup-admin`

## Local
```
cd server && npm install
# tạo server/.env với DATABASE_URL + Cloudinary
node src/seed.js
npm run dev

cd client && npm install && npm run dev
```
Sửa `client/src/services/api.js` → `baseURL: 'http://localhost:5000/api'` khi chạy local.
