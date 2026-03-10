# Jitterbit Order API

A complete REST API for order management, developed in Node.js with Express, TypeScript and MySQL database. The API implements CRUD operations with automatic data transformation and robust validation.

## Features

- **Complete REST endpoints** for creating, reading, updating and deleting orders
- **Automatic data transformation** between API format and database format
- **Robust validation** with error messages in English
- **Error handling** with appropriate HTTP status codes (200, 201, 400, 404, 500)
- **MySQL database** with relational schema (Order and Items tables)
- **Unit tests** with Vitest for data validation
- **Clean and well-documented code** with descriptive comments
- **TypeScript** for type safety and better development experience

## Requirements

- Node.js 18+
- npm or pnpm
- MySQL 8.0+

## Installation

1. Clone the repository:
```bash
git clone https://github.com/igorlini22-cmd/jitterbit-order-api.git
cd jitterbit-order-api
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up the database:
```bash
pnpm db:push
```

4. Start the server:
```bash
pnpm dev
```

The server will be available at `http://localhost:3000`

## API Endpoints

### Create Order
**POST** `/api/order`

Creates a new order with its items.

**Request Body:**
```json
{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "orderId": "v10089015vdb-01",
    "value": 10000,
    "creationDate": "2023-07-19T12:24:11.529Z",
    "items": [
      {
        "productId": 2434,
        "quantity": 1,
        "price": 1000
      }
    ]
  }
}
```

### Get Specific Order
**GET** `/api/order/:orderId`

Retrieves a specific order by order number.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orderId": "v10089015vdb-01",
    "value": 10000,
    "creationDate": "2023-07-19T12:24:11.529Z",
    "items": [
      {
        "productId": 2434,
        "quantity": 1,
        "price": 1000
      }
    ]
  }
}
```

### List All Orders
**GET** `/api/order/list`

Lists all orders with their items.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "orderId": "v10089015vdb-01",
      "value": 10000,
      "creationDate": "2023-07-19T12:24:11.529Z",
      "items": [...]
    }
  ]
}
```

### Update Order
**PUT** `/api/order/:orderId`

Updates an existing order.

**Request Body (all fields optional):**
```json
{
  "valorTotal": 15000,
  "dataCriacao": "2023-07-20T10:00:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orderId": "v10089015vdb-01",
    "value": 15000,
    "creationDate": "2023-07-20T10:00:00.000Z",
    "items": [...]
  }
}
```

### Delete Order
**DELETE** `/api/order/:orderId`

Deletes an order and its items.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Order v10089015vdb-01 deleted successfully",
    "orderId": "v10089015vdb-01"
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Successful request (GET, PUT) |
| 201 | Created - Resource created successfully (POST) |
| 400 | Bad Request - Invalid or incomplete data |
| 404 | Not Found - Order not found |
| 500 | Internal Server Error - Server error |

## Project Structure

```
jitterbit-order-api/
├── drizzle/
│   ├── schema.ts          # Table definitions (Order, Items, Users)
│   └── migrations/        # Migration history
├── server/
│   ├── _core/
│   │   └── index.ts       # Express configuration and routes
│   ├── db.ts              # Database access functions
│   ├── orderRoutes.ts     # Order API endpoints
│   ├── orderValidation.ts # Data validation and transformation
│   ├── orderValidation.test.ts # Unit tests
│   └── routers.ts         # tRPC routes
├── client/                # React frontend (optional)
├── package.json           # Project dependencies
├── drizzle.config.ts      # Drizzle ORM configuration
└── README.md              # This file
```

## Data Transformation

The API automatically transforms data between request format and database format:

**Input (API):**
- `numeroPedido` → `orderId`
- `valorTotal` → `value`
- `dataCriacao` → `creationDate`
- `idItem` → `productId`
- `quantidadeItem` → `quantity`
- `valorItem` → `price`

## Validation

The API validates all input data:

- **numeroPedido**: Required, non-empty string
- **valorTotal**: Required, positive number
- **dataCriacao**: Required, valid ISO 8601 datetime
- **items**: Required, array with at least one item
- **idItem**: Required, non-empty string
- **quantidadeItem**: Required, positive integer
- **valorItem**: Required, positive number

## Testing

Run unit tests:

```bash
pnpm test
```

Tests cover:
- Input data validation
- Data transformation
- Error handling
- Edge cases and validations

## Development

Start the server in development mode with hot reload:

```bash
pnpm dev
```

Check TypeScript types:

```bash
pnpm check
```

Format code:

```bash
pnpm format
```

## Usage Examples with cURL

Create an order:
```bash
curl --location 'http://localhost:3000/api/order' \
--header 'Content-Type: application/json' \
--data '{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}'
```

Get an order:
```bash
curl --location 'http://localhost:3000/api/order/v10089015vdb-01'
```

List all orders:
```bash
curl --location 'http://localhost:3000/api/order/list'
```

Update an order:
```bash
curl --location --request PUT 'http://localhost:3000/api/order/v10089015vdb-01' \
--header 'Content-Type: application/json' \
--data '{
  "valorTotal": 15000
}'
```

Delete an order:
```bash
curl --location --request DELETE 'http://localhost:3000/api/order/v10089015vdb-01'
```

## Error Handling

Example error response:

```json
{
  "success": false,
  "error": "Invalid order data",
  "details": {
    "numeroPedido": ["Order number is required"],
    "items": ["At least one item is required"]
  }
}
```

## Database

### Table: orders
| Column | Type | Description |
|--------|------|-------------|
| orderId | VARCHAR(64) | Unique order identifier (primary key) |
| value | INT | Total order value in cents |
| creationDate | TIMESTAMP | Order creation date |
| updatedAt | TIMESTAMP | Last update date |

### Table: items
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Unique item identifier (primary key) |
| orderId | VARCHAR(64) | Order reference (foreign key) |
| productId | INT | Product identifier |
| quantity | INT | Item quantity |
| price | INT | Unit price in cents |
| createdAt | TIMESTAMP | Item creation date |

## License

MIT

## Contact

For questions or suggestions, please contact the development team.
