# Split Backend API

Backend API for Split expense-sharing application. This is a RESTful API built with Express.js and MongoDB.

## Features

- User authentication and authorization with JWT
- User management (register, login, profile management, password reset)
- Friend management (add friends)
- Expense tracking and splitting
- Group management for shared expenses
- Settle up functionality between users

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Project Structure

```
split-backend/
  ├── config/
  │   └── db.js
  ├── controllers/
  │   ├── userController.js
  │   ├── expenseController.js
  │   └── groupController.js
  ├── middleware/
  │   ├── auth.js
  │   └── errorHandler.js
  ├── models/
  │   ├── User.js
  │   ├── Expense.js
  │   ├── Group.js
  │   └── Settlement.js
  ├── routes/
  │   ├── userRoutes.js
  │   ├── expenseRoutes.js
  │   └── groupRoutes.js
  ├── utils/
  │   └── expenseUtils.js
  ├── .env
  ├── package.json
  ├── README.md
  └── server.js
```

## Setting Up

1. **Clone the repository**

2. **Install dependencies**
   ```
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory and add the following:
   ```
   NODE_ENV=development
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/split
   JWT_SECRET=yourjwtsecret
   JWT_EXPIRE=30d
   RESET_PASSWORD_EXPIRE=10m
   ```

4. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGO_URI` in your `.env` file

5. **Running the Server**
   - Development mode:
     ```
     npm run dev
     ```
   - Production mode:
     ```
     npm start
     ```

## API Endpoints

### User Routes
- `POST /api/users` - Register user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `GET /api/users` - Get all users for adding friends (protected)
- `POST /api/users/add-friend` - Add a friend (protected)
- `POST /api/users/reset-password-request` - Request password reset
- `POST /api/users/reset-password` - Reset password with token

### Expense Routes
- `POST /api/expenses` - Create a new expense (protected)
- `GET /api/expenses/my-expenses` - Get user's expenses (protected)
- `GET /api/expenses/:id` - Get expense by ID (protected)
- `PUT /api/expenses/:id` - Update expense (protected)
- `DELETE /api/expenses/:id` - Delete expense (protected)
- `POST /api/expenses/settle-up` - Settle up with a friend (protected)

### Group Routes
- `POST /api/groups` - Create a new group (protected)
- `GET /api/groups/my-groups` - Get user's groups (protected)
- `GET /api/groups/:id` - Get group by ID (protected)
- `DELETE /api/groups/:id` - Delete group (protected)
- `POST /api/groups/:id/members` - Add member to group (protected)
- `DELETE /api/groups/:id/members/:memberId` - Remove member from group (protected)

## Front-end Integration

This backend API works with the Split front-end application located in the separate repository.

## License

This project is licensed under the MIT License.
