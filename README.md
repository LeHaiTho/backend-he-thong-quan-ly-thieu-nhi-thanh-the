# Backend - Hệ thống quản lý Thiếu Nhi Thánh Thể

## Cài đặt

```bash
npm install
```

## Cấu hình môi trường

- Copy `.env.example` thành `.env` và điền biến môi trường cần thiết.

## Chạy dev

```bash
npm run dev
```

## Chạy production

```bash
npm start
```

# Express Development Server

Đây là một server Node.js Express cơ bản được cấu hình cho mục đích phát triển.

## Cấu trúc thư mục
```
server/
├── src/
│   ├── config/        # Cấu hình (multer, db, v.v.)
│   ├── controllers/   # Xử lý logic nghiệp vụ
│   ├── routes/        # Định nghĩa các endpoint
│   ├── middlewares/   # Các hàm trung gian (auth, log, error)
│   ├── services/      # Tầng giao tiếp dữ liệu (nếu có)
│   ├── utils/         # Các hàm tiện ích
│   ├── uploads/       # Nơi lưu trữ file upload
│   ├── app.js         # Cấu hình Express app
│   └── server.js      # Entry point để chạy server
├── .env               # Biến môi trường
└── package.json       # Quản lý dependencies và scripts
```

## Hướng dẫn cài đặt và chạy

1. **Di chuyển vào thư mục server:**
   ```bash
   cd server
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Chạy server ở chế độ development (với nodemon):**
   ```bash
   npm run dev
   ```

4. **Chạy server ở chế độ production:**
   ```bash
   npm start
   ```

## Các API mẫu

### 1. Kiểm tra trạng thái server
- **URL:** `GET http://localhost:5000/api/health`
- **Mô tả:** Kiểm tra xem server có đang hoạt động không.

### 2. Upload file ảnh
- **URL:** `POST http://localhost:5000/api/upload`
- **Body (form-data):**
  - Key: `file`
  - Value: (Chọn file .jpg hoặc .png)
- **Mô tả:** Upload file lên server. Trả về đường dẫn và URL để truy cập file.

### 3. Truy cập file tĩnh
- **URL:** `http://localhost:5000/uploads/<tên_file>`
- **Mô tả:** Truy cập trực tiếp các file đã upload qua trình duyệt.
