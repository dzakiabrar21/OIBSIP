# 🍕 Pizza Delivery Application

A full-stack pizza delivery application built with React, Node.js, Express, and MongoDB.

## Features

### User Features
- **Authentication**: Register, Login, Verify Email, Forgot/Reset Password
- **Custom Pizza Builder**: Create custom pizzas step-by-step (Base -> Sauce -> Cheese -> Toppings)
- **Order Tracking**: Real-time status updates via Socket.io
- **Payment**: Razorpay integration (Test Mode)

### Admin Features
- **Dashboard**: Track revenue, pending orders, and low stock items
- **Inventory Management**: Create, Read, Update, Delete ingredients
- **Order Management**: Update order statuses (Received -> Kitchen -> Delivery -> Delivered)
- **Notifications**: Automatic email alerts when inventory stock drops below a set threshold

## Technologies Used
- **Frontend**: React.js, Vite, React Router DOM, Axios, Socket.io-client
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, Socket.io
- **Authentication**: JWT, bcryptjs
- **Email**: Nodemailer (Gmail SMTP)
- **Payments**: Razorpay
- **Styling**: Vanilla CSS with modern, dark-themed glassmorphism UI

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Gmail account (with App Password enabled for sending emails)
- Razorpay account (Test credentials)

### 1. Clone the repository

### 2. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   MONGO_URI=mongodb://localhost:27017/pizza-delivery
   JWT_SECRET=your_jwt_secret_key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   RAZORPAY_KEY_ID=rzp_test_xxxxxx
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ADMIN_EMAIL=admin@example.com
   CLIENT_URL=http://localhost:5173
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory:
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

### 4. Admin Setup & Initial Data
1. Register a new user on the frontend and select the "Admin" account type.
2. Verify the email (check the terminal or email inbox for the link).
3. Log in as the Admin.
4. Go to the **Inventory** tab and click **Seed Initial Inventory** to populate the database with default pizza ingredients.

## Payment Testing (Razorpay)
The application uses Razorpay in test mode. When checking out, use Razorpay test cards:
- **Card Number**: Use any valid-looking test card (e.g., `4111 1111 1111 1111`)
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: `122333`

*Note: You must include the Razorpay checkout script in your frontend `index.html` file.*

## License
MIT License
