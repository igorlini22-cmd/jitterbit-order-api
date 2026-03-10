/**
 * Order Management API Routes
 * Implements REST endpoints for CRUD operations on orders
 */

import { Router, Request, Response } from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
} from "./db";
import {
  createErrorResponse,
  createSuccessResponse,
  transformOrderData,
  transformOrderForResponse,
  validateIncomingOrder,
  validateUpdateOrder,
} from "./orderValidation";

const router = Router();

// ============================================================================
// POST /api/order - Create a new order
// ============================================================================
/**
 * Creates a new order with items
 * Expects JSON body with numeroPedido, valorTotal, dataCriacao, and items array
 * Returns 201 Created on success, 400 Bad Request on validation error
 */
router.post("/order", async (req: Request, res: Response) => {
  try {
    // Validate incoming order data
    const validation = validateIncomingOrder(req.body);

    if (!validation.valid) {
      return res.status(400).json(
        createErrorResponse(
          "Dados do pedido invalidos",
          validation.errors
        )
      );
    }

    // Transform API format to database format
    const transformedOrder = transformOrderData(validation.data);

    // Create order in database
    await createOrder(
      {
        orderId: transformedOrder.orderId,
        value: transformedOrder.value,
        creationDate: transformedOrder.creationDate,
      },
      transformedOrder.items
    );

    // Return created order
    return res.status(201).json(
      createSuccessResponse({
        orderId: transformedOrder.orderId,
        value: transformedOrder.value,
        creationDate: transformedOrder.creationDate,
        items: transformedOrder.items,
      })
    );
  } catch (error) {
    console.error("[API] Error creating order:", error);
    return res.status(500).json(
      createErrorResponse("Erro ao criar pedido. Tente novamente mais tarde.")
    );
  }
});

// ============================================================================
// GET /api/order/:orderId - Get a specific order
// ============================================================================
/**
 * Retrieves a specific order by orderId
 * Returns 200 OK with order data on success, 404 Not Found if order doesn't exist
 */
router.get("/order/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId || orderId.trim() === "") {
      return res.status(400).json(
        createErrorResponse("Numero do pedido e obrigatorio")
      );
    }

    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json(
        createErrorResponse(`Pedido com numero ${orderId} nao encontrado`)
      );
    }

    return res.status(200).json(
      createSuccessResponse(transformOrderForResponse(order, order.items))
    );
  } catch (error) {
    console.error("[API] Error retrieving order:", error);
    return res.status(500).json(
      createErrorResponse("Erro ao buscar pedido. Tente novamente mais tarde.")
    );
  }
});

// ============================================================================
// GET /api/order/list - List all orders
// ============================================================================
/**
 * Retrieves all orders with their items
 * Returns 200 OK with array of orders
 */
router.get("/order/list", async (req: Request, res: Response) => {
  try {
    const orders = await getAllOrders();

    return res.status(200).json(
      createSuccessResponse(
        orders.map((order) =>
          transformOrderForResponse(order, order.items || [])
        )
      )
    );
  } catch (error) {
    console.error("[API] Error listing orders:", error);
    return res.status(500).json(
      createErrorResponse("Erro ao listar pedidos. Tente novamente mais tarde.")
    );
  }
});

// ============================================================================
// PUT /api/order/:orderId - Update an order
// ============================================================================
/**
 * Updates an existing order
 * Expects JSON body with fields to update (all optional)
 * Returns 200 OK with updated order, 404 Not Found if order doesn't exist
 */
router.put("/order/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId || orderId.trim() === "") {
      return res.status(400).json(
        createErrorResponse("Numero do pedido e obrigatorio")
      );
    }

    // Check if order exists
    const existingOrder = await getOrderById(orderId);
    if (!existingOrder) {
      return res.status(404).json(
        createErrorResponse(`Pedido com numero ${orderId} nao encontrado`)
      );
    }

    // Validate update data
    const validation = validateUpdateOrder(req.body);
    if (!validation.valid) {
      return res.status(400).json(
        createErrorResponse(
          "Dados de atualizacao invalidos",
          validation.errors
        )
      );
    }

    // Prepare update object
    const updateData: any = {};
    if (validation.data.valorTotal !== undefined) {
      updateData.value = validation.data.valorTotal;
    }
    if (validation.data.dataCriacao !== undefined) {
      updateData.creationDate = new Date(validation.data.dataCriacao);
    }

    // Update order
    const updatedOrder = await updateOrder(orderId, updateData);

    if (!updatedOrder) {
      return res.status(404).json(
        createErrorResponse(`Pedido com numero ${orderId} nao encontrado`)
      );
    }

    return res.status(200).json(
      createSuccessResponse(
        transformOrderForResponse(updatedOrder, updatedOrder.items || [])
      )
    );
  } catch (error) {
    console.error("[API] Error updating order:", error);
    return res.status(500).json(
      createErrorResponse("Erro ao atualizar pedido. Tente novamente mais tarde.")
    );
  }
});

// ============================================================================
// DELETE /api/order/:orderId - Delete an order
// ============================================================================
/**
 * Deletes an order and its items
 * Returns 200 OK on success, 404 Not Found if order doesn't exist
 */
router.delete("/order/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId || orderId.trim() === "") {
      return res.status(400).json(
        createErrorResponse("Numero do pedido e obrigatorio")
      );
    }

    // Check if order exists
    const existingOrder = await getOrderById(orderId);
    if (!existingOrder) {
      return res.status(404).json(
        createErrorResponse(`Pedido com numero ${orderId} nao encontrado`)
      );
    }

    // Delete order
    await deleteOrder(orderId);

    return res.status(200).json(
      createSuccessResponse({
        message: `Pedido ${orderId} deletado com sucesso`,
        orderId,
      })
    );
  } catch (error) {
    console.error("[API] Error deleting order:", error);
    return res.status(500).json(
      createErrorResponse("Erro ao deletar pedido. Tente novamente mais tarde.")
    );
  }
});

export default router;
