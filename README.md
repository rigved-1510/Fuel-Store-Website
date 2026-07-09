# Fuel Store

Fuel Store is a full-stack e-commerce web application built for fashion and apparel shopping. It provides a modern shopping experience with secure user authentication, product browsing, shopping cart, wishlist, order management, and an admin dashboard for inventory management. The application follows a responsive design and uses a RESTful API architecture to connect the frontend and backend. Product images are stored on Cloudinary, while the application is deployed using Vercel (frontend) and Railway (backend).

**Department of Information Technology**  
*National Institute of Technology Karnataka (NITK) - Surathkal, India*

---

## Features

### Customer Features
- User registration and secure JWT-based authentication
- Browse products by category
- Product search functionality
- Shopping cart management
- Wishlist management
- Responsive product pages
- User profile management
- Change password functionality
- Order placement and order history

### Admin Features
- Admin authentication and protected routes
- Add, update, and delete products
- Upload product images using Cloudinary
- Manage product inventory
- View customer orders
- Dashboard for product management

### Technical Features
- RESTful API architecture
- JWT authentication and authorization
- Password hashing using bcrypt
- Cloud image storage with Cloudinary
- MySQL relational database
- Responsive React frontend
- Protected API endpoints
- Error handling and input validation

---

## Tech Stack

### Frontend
- React.js
- JavaScript (ES6+)
- HTML5
- CSS3
- React Router
- Context API
- Vite

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt
- Multer
- Cloudinary

### Database
- MySQL

### Deployment
- Vercel
- Railway
- Cloudinary

---

## How to Run

### 1. Clone the repository

```bash
git clone <repository-url>
cd Fuel-Store
```

### 2. Install dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend
npm install
```

---

### 3. Configure environment variables

Create a `.env` file inside the backend directory.

```env
PORT=5000

DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=fuel_store

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create a `.env` file inside the frontend directory.

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 4. Create the database

Import the provided SQL schema and seed files into MySQL.

```sql
schema.sql
seed.sql
```

---

### 5. Start the backend

```bash
cd backend
npm run dev
```

---

### 6. Start the frontend

```bash
cd frontend
npm run dev
```

---

### 7. Open the application

Frontend:

```
http://localhost:5173
```

Backend API:

```
http://localhost:5000
```
