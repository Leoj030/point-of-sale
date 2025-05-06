# POS Server API Documentation

## Overview

This server provides a RESTful API for authentication, user management, and inventory management. All endpoints accept and return data in **JSON format**.

### Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "message": string,
  "data"?: any,
  "error"?: any
}
```

---

## Authentication

Base path: `/api/auth`

- **JWT-based authentication** with token versioning for session invalidation.
- **Secure password hashing** using bcrypt.
- **Validation** for all input fields.

### POST `/api/auth/login`

- **Description:** Log in a user.
- **Request Body:**

  ```json
  { "username": "admin", "password": "yourpassword" }
  ```

- **Response:** JSON with a `token` in the `data` field on success.
- **Response Example:**

  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "<JWT_TOKEN>"
    }
  }
  ```

### POST `/api/auth/logout`

- **Description:** Log out the authenticated user (requires authentication).
- **Headers:** `Authorization: Bearer <token>`
- **Response:** JSON
- **Response Example:**

  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```

---

## User Management

Base path: `/api/user`

- **All user routes are protected and require admin role.**
- **Full CRUD operations** for users.
- **Strong validation** for all user fields.

### POST `/api/user/register`

- **Description:** Register a new user (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

  ```json
  {
    "name": "John Doe",
    "username": "johndoe",
    "password": "securepassword",
    "role": "ADMIN"
  }
  ```

- **Response Example:**

  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "_id": "USER_ID_1",
      "name": "John Doe",
      "username": "johndoe",
      "role": "ADMIN"
    }
  }
  ```

#### GET `/api/user/list`

- **Description:** List all users (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Response Example:**

  ```json
  {
    "success": true,
    "message": "Users fetched",
    "data": [
      {
        "_id": "USER_ID_1",
        "name": "John Doe",
        "username": "johndoe",
        "role": "ADMIN"
      },
      {
        "_id": "USER_ID_2",
        "name": "Jane Smith",
        "username": "janesmith",
        "role": "CASHIER"
      }
    ]
  }
  ```

#### PUT `/api/user/update/:id`

- **Description:** Update a user by ID (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

  ```json
  {
    "name": "John D.",
    "role": "CASHIER"
  }
  ```

- **Response Example:**

  ```json
  {
    "success": true,
    "message": "User updated successfully",
    "data": {
      "_id": "USER_ID_1",
      "name": "John D.",
      "username": "johndoe",
      "role": "CASHIER"
    }
  }
  ```

#### DELETE `/api/user/delete/:id`

- **Description:** Delete a user by ID (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Response Example:**

  ```json
  {
    "success": true,
    "message": "User deleted successfully",
    "data": {
      "_id": "USER_ID_1",
      "name": "John D.",
      "username": "johndoe",
      "role": "CASHIER"
    }
  }
  ```

---

## Inventory

Base path: `/api/inventory`

### Categories

#### GET `/api/inventory/categories`

- **Description:** List all categories.
- **Response Example:**

  ```json
  {
    "success": true,
    "message": "Categories fetched",
    "data": [
      { "_id": "CATEGORY_ID_1", "name": "Beverages" },
      { "_id": "CATEGORY_ID_2", "name": "Snacks" }
    ]
  }
  ```

#### POST `/api/inventory/categories`

- **Description:** Create a new category (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Example:**

  ```json
  { "name": "Beverages" }
  ```

- **Response Example:**

  ```json
  {
    "success": true,
    "message": "Category created",
    "data": { "_id": "CATEGORY_ID_1", "name": "Beverages" }
  }
  ```

#### PUT `/api/inventory/categories/:id`

- **Description:** Update a category by ID (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Example:**

  ```json
  { "name": "Hot Drinks" }
  ```

- **Response Example:**

  ```json
  {
    "success": true,
    "message": "Category updated",
    "data": { "_id": "CATEGORY_ID_1", "name": "Hot Drinks" }
  }
  ```

#### DELETE `/api/inventory/categories/:id`

- **Description:** Delete a category by ID (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Response Example:**

  ```json
  {
    "success": true,
    "message": "Category deleted",
    "data": { "_id": "CATEGORY_ID_1", "name": "Hot Drinks" }
  }
  ```

### Products

#### GET `/api/inventory/products`

- **Description:** List all products. Supports query parameters:
  - `categoryId` (optional): Filter by category. Use 'all' or empty for all categories.
  - `sort` (optional): Use 'alpha-desc' for descending alphabetical order, otherwise ascending.
- **Response Example:**

  ```json
  {
    "success": true,
    "message": "Products fetched",
    "data": [
      {
        "_id": "PRODUCT_ID_1",
        "name": "Coffee",
        "description": "Freshly brewed coffee",
        "price": 100,
        "imageUrl": "https://example.com/coffee.jpg",
        "category": "CATEGORY_ID_1"
      }
    ]
  }
  ```

#### POST `/api/inventory/products`

- **Description:** Create a new product (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Example:**

  ```json
  {
    "name": "Coffee",
    "description": "Freshly brewed coffee",
    "price": 100,
    "imageUrl": "https://example.com/coffee.jpg",
    "category": "CATEGORY_ID_1"
  }
  ```

- **Response Example:**

  ```json
  {
    "success": true,
    "message": "Product created",
    "data": {
      "_id": "PRODUCT_ID_1",
      "name": "Coffee",
      "description": "Freshly brewed coffee",
      "price": 100,
      "imageUrl": "https://example.com/coffee.jpg",
      "category": "CATEGORY_ID_1"
    }
  }
  ```

#### PUT `/api/inventory/products/:id`

- **Description:** Update a product by ID (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Example:**

  ```json
  {
    "name": "Espresso",
    "price": 120
  }
  ```

- **Response Example:**

  ```json
  {
    "success": true,
    "message": "Product updated",
    "data": {
      "_id": "PRODUCT_ID_1",
      "name": "Espresso",
      "description": "Freshly brewed coffee",
      "price": 120,
      "imageUrl": "https://example.com/coffee.jpg",
      "category": "CATEGORY_ID_1"
    }
  }
  ```

#### DELETE `/api/inventory/products/:id`

- **Description:** Delete a product by ID (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Response Example:**

  ```json
  {
    "success": true,
    "message": "Product deleted",
    "data": {
      "_id": "PRODUCT_ID_1",
      "name": "Espresso",
      "description": "Freshly brewed coffee",
      "price": 120,
      "imageUrl": "https://example.com/coffee.jpg",
      "category": "CATEGORY_ID_1"
    }
  }
  ```

---

### Orders

Base path: `/api/inventory/orders`

#### POST `/api/inventory/orders`

- **Description:** Create a new order (cashier or admin).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

  ```json
  {
    "items": [
      { "id": "PRODUCT_ID_1", "productName": "Burger", "price": 100, "quantity": 2 },
      { "id": "PRODUCT_ID_2", "productName": "Fries", "price": 50, "quantity": 1 }
    ],
    "orderType": "Dine In",
    "paymentMethod": "Cash"
  }
  ```

- **Response:** JSON with created order (includes `orderId`, does not include MongoDB `_id`).

#### GET `/api/inventory/orders`

- **Description:** List all orders (cashier or admin).
- **Headers:** `Authorization: Bearer <token>`
- **Response:** JSON array of orders in `data` (no MongoDB `_id`).

#### GET `/api/inventory/orders/:orderId`

- **Description:** Get a specific order by its `orderId` (cashier or admin).
- **Headers:** `Authorization: Bearer <token>`
- **Response:** JSON order object (no MongoDB `_id`).

#### PATCH `/api/inventory/orders/:orderId/status`

- **Description:** Update the status of an order (cashier or admin).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

  ```json
  { "status": "Completed" }
  ```

- **Response:** JSON with updated order.

#### DELETE `/api/inventory/orders/:orderId`

- **Description:** Delete an order (cashier or admin).
- **Headers:** `Authorization: Bearer <token>`
- **Response:** JSON with deleted order.

---

### Sales Report

Base path: `/api/reports/sales`

#### GET `/api/reports/sales`

- **Description:** Get total sales for today, this week, and this month (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Response:**

  ```json
  {
    "success": true,
    "message": "Sales report fetched",
    "data": {
      "today": 1234,
      "thisWeek": 5678,
      "thisMonth": 91011
    }
  }
  ```

---

## Validation

- All endpoints use strong validation (see `src/validators/`).
- Validation errors are returned in the standard response format.

---

## Notes

- All endpoints require and return JSON.
- All protected routes require a valid JWT in the `Authorization` header as `Bearer <token>`.
- The `success` and `message` fields are always present in responses. `data` is present on success, `error` on failure.

---

**Features:**

- Robust authentication and session management
- Full user CRUD with admin protection
- Inventory and category management
- Strong validation and error handling
- Consistent API response format

For more details, see the code in the `src/` directory.
