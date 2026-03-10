# Jitterbit Order API - Development TODO

## Database Schema
- [x] Create Order table (orderId, value, creationDate)
- [x] Create Items table (orderId, productId, quantity, price)
- [x] Set up foreign key relationships
- [x] Apply migrations with pnpm db:push

## API Endpoints - Core Requirements
- [x] POST /api/order - Create new order with field mapping
- [x] GET /api/order/:orderId - Retrieve specific order
- [x] GET /api/order/list - List all orders
- [x] PUT /api/order/:orderId - Update existing order
- [x] DELETE /api/order/:orderId - Delete order

## Data Validation & Transformation
- [x] Input validation for order creation
- [x] Field mapping (numeroPedido to orderId, valorTotal to value, etc.)
- [x] Item field mapping (idItem to productId, quantidadeItem to quantity, valorItem to price)
- [x] Error messages in Portuguese

## Error Handling
- [x] HTTP 200 OK for successful GET/PUT
- [x] HTTP 201 Created for successful POST
- [x] HTTP 400 Bad Request for validation errors
- [x] HTTP 404 Not Found for missing resources
- [x] HTTP 500 Internal Server Error for server issues

## Code Quality
- [x] Clean code structure with comments
- [x] Proper naming conventions
- [x] Organized file structure
- [x] Database query helpers
- [x] Error handling middleware

## Testing
- [x] Unit tests for validation logic
- [x] All tests passing (11 tests)

## GitHub Preparation
- [ ] Clean git history
- [ ] Organized commit messages
- [ ] README with setup instructions
- [ ] No AI traces in code
