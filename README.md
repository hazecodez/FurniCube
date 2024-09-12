# FurniCube eCommerce Website

FurniCube is a fully functional eCommerce platform designed to showcase and strengthen my web development skills. Built using Node.js, EJS for frontend views, and MongoDB for the database, this project includes all the key features necessary for both users and administrators to manage products, orders, payments, and more.

## Features:

### User Features:

- User Authentication: Secure signup with OTP verification.
- Product Interaction: Users can view products, zoom in on product images, add items to their cart or wishlist.
- User Profile & Wallet: Personalized profiles and digital wallets for seamless transactions.
- Multiple Address Management: Add and manage multiple delivery addresses for faster checkout.
- Payment Methods: Supports multiple payment options including Razorpay, Cash on Delivery (COD), and wallet payments.
- Order Management: View and download order invoices, return products within a specified time, and receive refunds in the user's wallet.

### Admin Panel Features:

- Sales Statistics: Detailed sales reports are available for daily, weekly, monthly, and yearly performance.
- Report Generation: Export reports for in-depth analysis.
- Product Management: Admins can add, edit, and manage products, along with their categories.
- Coupon Management: Create and edit coupons to attract customers.
- User Management: Efficiently manage user accounts.

## Technology Stack

- Backend: Node.js
- Database: MongoDB
- Frontend: EJS, CSS
- Payment Integration: Razorpay
- Image Uploading: Multer
- Email Services: Nodemailer (for sending emails during registration)

## How to Set Up

Clone the project

```bash
  git clone https://github.com/hazecodez/FurniCube.git
```

Go to the project directory

```bash
  cd FurniCube
```

Install dependencies

```bash
  npm install
```

Create a .env file in the root directory and configure the following variables:

```bash
  Mongo_uri=your_mongo_db_uri
  RazorId=your_razorpay_key_id
  RazorKey=your_razorpay_key_secret
  EMAIL=your_email_service
  PASS=your_email_password
  SECRET=your_session_secret

```

Run the application:

```bash
  npm run start
```

- Visit http://localhost:5030 in your browser to access the platform.