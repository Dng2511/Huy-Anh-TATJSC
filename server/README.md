# Hướng dẫn sử dụng Backend

Tài liệu ngắn hướng dẫn cài đặt và chạy phần backend của dự án.

## Mô tả
Repository chứa backend Node.js (Express + Mongoose) và một dịch vụ tối ưu hóa nhỏ bằng Python trong `optimizer-service/`.

## Yêu cầu
- Node.js 18+ và npm
- MongoDB (uri kết nối)
- Python 3.8+ (chỉ để chạy `optimizer-service` nếu cần)

## Cài đặt
1. Clone repository và chuyển vào thư mục dự án:

```bash
cd server
npm install
```

2. Tạo file `.env` ở gốc (bên cạnh `package.json`) chứa biến môi trường cần thiết. Ví dụ:

```
MONGODB_URI=mongodb://user:pass@host:port/database
PORT=3000
JWT_SECRET=your_jwt_secret
# Initial admin account (optional but recommended)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strongpassword
ADMIN_NAME=Administrator
```

Lưu ý: `MONGODB_URI` và `JWT_SECRET` là bắt buộc — ứng dụng sẽ lỗi nếu các biến này chưa cấu hình.

## Scripts hữu ích
- `npm run dev` — chạy trong môi trường phát triển (nodemon), lắng nghe thay đổi trong `src/`.
- `npm start` — chạy production: `node src/server.js`.
- `npm run seed` — chạy script seed dữ liệu (`src/seed/seed.js`).

Ví dụ chạy dev:

```bash
npm run dev
```

## Cấu hình kết nối DB
Kết nối tới MongoDB được đọc từ biến môi trường `MONGODB_URI` (xem `src/config/db.js`).

## Dịch vụ tối ưu hóa (Python)
Thư mục `optimizer-service/` chứa một dịch vụ Python độc lập. Để chạy:

```bash
cd optimizer-service
python -m venv .venv
.venv\Scripts\activate    # Windows
pip install -r requirements.txt
python app.py
```

## Seed dữ liệu
Để nạp dữ liệu mẫu, chạy:

```bash
npm run seed
```

## Tài liệu schema
Chi tiết schema và cấu trúc dữ liệu: xem `DATABASE_SCHEMA.md`.

## Tệp quan trọng
- Cấu hình DB: `src/config/db.js`
- Điểm vào server: `src/server.js`
- Routes chính: `src/routes/` và `src/routes/routeOptimization.js`
- Scripts seed: `src/seed/seed.js`

## Ghi chú
- Nếu gặp lỗi kết nối MongoDB, kiểm tra `MONGODB_URI` và quyền truy cập mạng tới DB.
- Thêm hoặc sửa các biến môi trường trong `.env` theo nhu cầu triển khai.

## API Reference

Base path: `/api` (tất cả routes dữ liệu yêu cầu authentication, ngoại trừ `/api/auth/*`).

Authentication
- `POST /api/auth/login` — body: `{ "username": string, "password": string }`.
 - `POST /api/auth/login` — body: `{ "email"?: string, "username"?: string, "password": string }`.
	- Response: `{ "token": string, "user": { "username": string, "role": "admin" } }`.
	- Mặc định `ADMIN_USERNAME` / `ADMIN_PASSWORD` (env) = `admin` / `admin123`.
	- Sử dụng header `Authorization: Bearer <token>` cho các route được bảo vệ.
	 - If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `.env`, the server will create an initial admin user on first startup.
	 - Sử dụng header `Authorization: Bearer <token>` cho các route được bảo vệ.

CRUD resources
Các resource sau hỗ trợ CRUD thông qua các endpoints tiêu chuẩn (định nghĩa trong `src/routes/createCrudRouter.js`):

- `orders`, `vehicles`, `drivers`, `trips`, `tracking`, `inventory`, `costs`, `invoices`, `users`, `metrics`

Với `<resource>` thay bằng một trong các resource trên:
- `GET /api/<resource>` — trả về danh sách (Array).
- `GET /api/<resource>/:id` — trả về một bản ghi (404 nếu không tồn tại).
- `POST /api/<resource>` — tạo mới (201, trả về object vừa tạo).
- `PUT /api/<resource>/:id` — cập nhật (trả về object đã cập nhật hoặc 404).
- `DELETE /api/<resource>/:id` — xóa (204 no content hoặc 404).

Route optimizer
- `POST /api/route-optimizer/optimize` — chuyển tiếp body tới dịch vụ tối ưu hóa Python.
	- Dịch vụ tối ưu hóa được cấu hình bằng `ROUTE_OPTIMIZER_URL` (mặc định `http://127.0.0.1:8000`).
	- Response và status code trả về tương tự service tối ưu.

Ví dụ nhanh
- Login (curl):

```bash
curl -X POST http://localhost:5000/api/auth/login \
	-H 'Content-Type: application/json' \
	-d '{"username":"admin","password":"admin123"}'
```

- Lấy danh sách orders (cần token):

```bash
curl http://localhost:5000/api/orders \
	-H 'Authorization: Bearer <token>'
```

Lỗi phổ biến
- Validation error: `400` với `{ message: 'Validation error', details }`.
- Invalid id: `400` với `{ message: 'Invalid id format' }`.
- Not found: `404` với `{ message: 'Not found' }`.

---

Nếu muốn, tôi có thể tạo thêm danh sách endpoint dạng Markdown chi tiết cho frontend hoặc xuất collection Postman/Insomnia.
