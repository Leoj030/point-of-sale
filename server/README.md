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
- **Request Body:** `{ username: string, password: string }`
- **Response:** JSON with a `token` in the `data` field on success.

### POST `/api/auth/logout`

- **Description:** Log out the authenticated user (requires authentication).
- **Headers:** `Authorization: Bearer <token>`
- **Response:** JSON

---

## User Management

Base path: `/api/user`

- **All user routes are protected and require admin role.**
- **Full CRUD operations** for users.
- **Strong validation** for all user fields.

### POST `/api/user/register`

- **Description:** Register a new user (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `{ name: string, username: string, password: string, role: string }`
- **Response:** JSON

### GET `/api/user/list`

- **Description:** List all users (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `userId` (optional), `sort` (optional: 'alpha-desc' or ascending)
- **Response:** JSON array of users in `data`.

### PUT `/api/user/update/:id`

- **Description:** Update a user by ID (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Any updatable user fields (`name`, `username`, `password`, `role`, `isActive`)
- **Response:** JSON

### DELETE `/api/user/delete/:id`

- **Description:** Delete a user by ID (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Response:** JSON

---

## Inventory

Base path: `/api/inventory`

### Categories

#### GET `/api/inventory/categories`

- **Description:** List all categories.
- **Response:** JSON array of categories in `data`.

#### POST `/api/inventory/categories`

- **Description:** Create a new category (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `{ name: string }`
- **Response:** JSON

#### PUT `/api/inventory/categories/:id`

- **Description:** Update a category by ID (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `{ name: string }`
- **Response:** JSON

#### DELETE `/api/inventory/categories/:id`

- **Description:** Delete a category by ID (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Response:** JSON

### Products

#### GET `/api/inventory/products`

- **Description:** List all products. Supports query parameters:
  - `categoryId` (optional): Filter by category. Use 'all' or empty for all categories.
  - `sort` (optional): Use 'alpha-desc' for descending alphabetical order, otherwise ascending.
- **Response:** JSON array of products in `data`.

#### POST `/api/inventory/products`

- **Description:** Create a new product (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `{ name, description, price, imageUrl, category }`
- **Response:** JSON

#### PUT `/api/inventory/products/:id`

- **Description:** Update a product by ID (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Any updatable product fields.
- **Response:** JSON

#### DELETE `/api/inventory/products/:id`

- **Description:** Delete a product by ID (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Response:** JSON

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

### Example JSON for creating/updating categories

```json
{
  "name": "Beverages"
}
```

### Example JSON for creating/updating products

```json
{
  "name": "Coffee",
  "description": "Freshly brewed coffee",
  "price": 100,
  "imageUrl": "https://example.com/coffee.jpg",
  "category": "CATEGORY_ID"
}
```

---

**Features:**

- Robust authentication and session management
- Full user CRUD with admin protection
- Inventory and category management
- Strong validation and error handling
- Consistent API response format

For more details, see the code in the `src/` directory.
