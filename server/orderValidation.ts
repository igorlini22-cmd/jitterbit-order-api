/**
 * Order Validation and Data Transformation Module
 * Handles validation and field mapping for order creation and updates
 */

import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for incoming order item from API request
 * Maps from API format (idItem, quantidadeItem, valorItem) to internal format
 */
const incomingItemSchema = z.object({
  idItem: z.string().min(1, "ID do item é obrigatório"),
  quantidadeItem: z.number().int().positive("Quantidade deve ser um número positivo"),
  valorItem: z.number().positive("Valor do item deve ser positivo"),
});

/**
 * Schema for incoming order from API request
 * Validates the request body structure and data types
 */
const incomingOrderSchema = z.object({
  numeroPedido: z.string().min(1, "Número do pedido é obrigatório"),
  valorTotal: z.number().positive("Valor total deve ser positivo"),
  dataCriacao: z.string().datetime("Data de criação deve ser um ISO string válido"),
  items: z.array(incomingItemSchema).min(1, "Pelo menos um item é obrigatório"),
});

/**
 * Schema for updating an order
 * All fields are optional
 */
const updateOrderSchema = z.object({
  numeroPedido: z.string().optional(),
  valorTotal: z.number().positive("Valor total deve ser positivo").optional(),
  dataCriacao: z.string().datetime("Data de criação deve ser um ISO string válido").optional(),
  items: z.array(incomingItemSchema).optional(),
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type IncomingOrder = z.infer<typeof incomingOrderSchema>;
export type IncomingItem = z.infer<typeof incomingItemSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

/**
 * Represents the transformed order ready for database storage
 */
export interface TransformedOrder {
  orderId: string;
  value: number;
  creationDate: Date;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
}

/**
 * API error response structure
 */
export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

/**
 * API success response structure
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates incoming order data
 * @param data - Raw order data from request
 * @returns Validated order data or error details
 */
export function validateIncomingOrder(
  data: unknown
): { valid: true; data: IncomingOrder } | { valid: false; errors: Record<string, string[]> } {
  const result = incomingOrderSchema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string[]> = {};
    result.error.issues.forEach((err: any) => {
      const path = err.path.join(".");
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(err.message);
    });
    return { valid: false, errors };
  }

  return { valid: true, data: result.data };
}

/**
 * Validates update order data
 * @param data - Raw update data from request
 * @returns Validated update data or error details
 */
export function validateUpdateOrder(
  data: unknown
): { valid: true; data: UpdateOrderInput } | { valid: false; errors: Record<string, string[]> } {
  const result = updateOrderSchema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string[]> = {};
    result.error.issues.forEach((err: any) => {
      const path = err.path.join(".");
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(err.message);
    });
    return { valid: false, errors };
  }

  return { valid: true, data: result.data };
}

// ============================================================================
// DATA TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transforms incoming order data to database format
 * Maps field names from API format to internal format:
 * - numeroPedido → orderId
 * - valorTotal → value
 * - dataCriacao → creationDate
 * - idItem → productId
 * - quantidadeItem → quantity
 * - valorItem → price
 *
 * @param incomingOrder - Order data from API request
 * @returns Transformed order ready for database
 */
export function transformOrderData(incomingOrder: IncomingOrder): TransformedOrder {
  return {
    orderId: incomingOrder.numeroPedido,
    value: incomingOrder.valorTotal,
    creationDate: new Date(incomingOrder.dataCriacao),
    items: incomingOrder.items.map((item) => ({
      productId: parseInt(item.idItem, 10),
      quantity: item.quantidadeItem,
      price: item.valorItem,
    })),
  };
}

/**
 * Transforms database order to API response format
 * Maps field names from internal format back to API format
 *
 * @param dbOrder - Order from database
 * @param dbItems - Items from database
 * @returns Order formatted for API response
 */
export function transformOrderForResponse(dbOrder: any, dbItems: any[]) {
  return {
    orderId: dbOrder.orderId,
    value: dbOrder.value,
    creationDate: dbOrder.creationDate,
    items: dbItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    })),
  };
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Creates a standardized error response
 * @param error - Error message
 * @param details - Optional error details
 * @returns Formatted error response
 */
export function createErrorResponse(
  error: string,
  details?: Record<string, string[]>
): ApiError {
  return {
    success: false,
    error,
    ...(details && { details }),
  };
}

/**
 * Creates a standardized success response
 * @param data - Response data
 * @returns Formatted success response
 */
export function createSuccessResponse<T>(data: T): ApiSuccess<T> {
  return {
    success: true,
    data,
  };
}
