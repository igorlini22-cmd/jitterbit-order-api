import { z } from "zod";

// Schemas para validação de pedidos
const incomingItemSchema = z.object({
  idItem: z.string().min(1, "ID do item é obrigatório"),
  quantidadeItem: z.number().int().positive("Quantidade deve ser um número positivo"),
  valorItem: z.number().positive("Valor do item deve ser positivo"),
});

const incomingOrderSchema = z.object({
  numeroPedido: z.string().min(1, "Número do pedido é obrigatório"),
  valorTotal: z.number().positive("Valor total deve ser positivo"),
  dataCriacao: z.string().datetime("Data de criação deve ser um ISO string válido"),
  items: z.array(incomingItemSchema).min(1, "Pelo menos um item é obrigatório"),
});

const updateOrderSchema = z.object({
  numeroPedido: z.string().optional(),
  valorTotal: z.number().positive("Valor total deve ser positivo").optional(),
  dataCriacao: z.string().datetime("Data de criação deve ser um ISO string válido").optional(),
  items: z.array(incomingItemSchema).optional(),
});

export type IncomingOrder = z.infer<typeof incomingOrderSchema>;
export type IncomingItem = z.infer<typeof incomingItemSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

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

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

// Validação de entrada
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

// Transformação de dados da API para o banco
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

// Transforma resposta do banco para formato da API
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

export function createSuccessResponse<T>(data: T): ApiSuccess<T> {
  return {
    success: true,
    data,
  };
}
