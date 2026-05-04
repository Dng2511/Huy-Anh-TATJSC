# Huy Anh TATJSC Workspace

Project da duoc tach thanh 2 phan chay rieng:

- frontend-window: React + Vite frontend
- server: Node.js + Express + MongoDB backend

## Cai dat

```bash
npm --prefix frontend-window install
npm --prefix server install
```

## Chay rieng tung phan

Frontend:

```bash
npm run frontend:dev
```

Backend:

```bash
npm run backend:dev
```

## Build frontend

```bash
npm run frontend:build
```

## Seed du lieu MongoDB

Truoc khi seed, tao file server/.env tu server/.env.example va cap nhat MONGODB_URI.

```bash
npm run backend:seed
```

## Dang nhap va middleware xac thuc

Tat ca route duoi /api (orders, vehicles, drivers, ...) da duoc bao ve bang middleware kiem tra token.

Route cong khai dang nhap:

POST http://localhost:5000/api/auth/login

Body JSON:

{
	"username": "admin",
	"password": "admin123"
}

Sau khi login, lay token trong response va gui trong header:

Authorization: Bearer <token>

## API backend

Base URL: http://localhost:5000/api

- `/orders`
- `/vehicles`
- `/drivers`
- `/trips`
- `/tracking`
- `/inventory`
- `/costs`
- `/invoices`
- `/users`
- `/metrics`

## Tuoi uu tuyen duong bang Google OR-Tools

Backend Node se goi sang service Python tai `http://127.0.0.1:8000` de toi uu tuyen.

API goi tu Node backend:

POST http://localhost:5000/api/route-optimizer/optimize

Body JSON mau:

{
	"depot": {
		"id": "DEPOT",
		"lat": 10.8231,
		"lng": 106.6297
	},
	"stops": [
		{
			"id": "DH-1002",
			"lat": 10.8504,
			"lng": 106.7712,
			"demand": 2
		},
		{
			"id": "DH-1003",
			"lat": 10.7769,
			"lng": 106.7009,
			"demand": 1
		}
	],
	"vehicle_count": 2,
	"vehicle_capacities": [5, 5]
}

Response tra ve danh sach route toi uu va cac diem chua phan bo neu co.
