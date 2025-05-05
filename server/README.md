# POS Server API Documentation

## Overview

This server provides a RESTful API for authentication and inventory management. All endpoints accept and return data in **JSON format**.

### Response Format

All API responses follow this structure:

```json
{
  "success": boolean, // true if the request succeeded, false otherwise
  "message": string,  // a human-readable message
  "data"?: any,       // present on success, contains the result
  "error"?: any       // present on failure, contains error details
}
```

---

## Authentication Routes

Base path: `/api/auth`

### POST `/api/auth/register`

- **Description:** Register a new user.
- **Request Body:** `{ name: string, username: string, password: string }`
- **Response:** JSON (see above)

### POST `/api/auth/login`

- **Description:** Log in a user.
- **Request Body:** `{ username: string, password: string }`
- **Response:** JSON with a `token` in the `data` field on success.

### POST `/api/auth/logout`

- **Description:** Log out the authenticated user (requires authentication).
- **Headers:** `Authorization: Bearer <token>`
- **Response:** JSON

---

## Inventory Routes

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
- **Example:** `/api/inventory/products?categoryId=<categoryId>&sort=alpha-desc`
- **Response:** JSON array of products in `data`.

#### POST `/api/inventory/products`

- **Description:** Create a new product (admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `{ name, description, price, imageUrl, categoryId }`
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

## Notes

- All endpoints require and return JSON.
- All protected routes require a valid JWT in the `Authorization` header as `Bearer <token>`.
- The `success` and `message` fields are always present in responses. `data` is present on success, `error` on failure.
- Validation errors and authentication errors are returned in the standard response format.

### Json Format for creating/updating categories

```json
{
  "name": string
}
```

---

### Json Format for creating/updating products

```json
{
  "name": string,
  "description": string,
  "price": number,
  "imageUrl": string,
  "category": string
}
```
