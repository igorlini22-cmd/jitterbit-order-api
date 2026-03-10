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

// Criar novo pedido
router.post("/order", async (req: Request, res: Response) => {
  try {
    const validation = validateIncomingOrder(req.body);

    if (!validation.valid) {
      return res.status(400).json(
        createErrorResponse(
          "Dados do pedido invalidos",
          validation.errors
        )
      );
    }

    const transformedOrder = transformOrderData(validation.data);

    await createOrder(
      {
        orderId: transformedOrder.orderId,
        value: transformedOrder.value,
        creationDate: transformedOrder.creationDate,
      },
      transformedOrder.items
    );

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

// Obter pedido específico
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

// Listar todos os pedidos
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

// Atualizar pedido
router.put("/order/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId || orderId.trim() === "") {
      return res.status(400).json(
        createErrorResponse("Numero do pedido e obrigatorio")
      );
    }

    const existingOrder = await getOrderById(orderId);
    if (!existingOrder) {
      return res.status(404).json(
        createErrorResponse(`Pedido com numero ${orderId} nao encontrado`)
      );
    }

    const validation = validateUpdateOrder(req.body);
    if (!validation.valid) {
      return res.status(400).json(
        createErrorResponse(
          "Dados de atualizacao invalidos",
          validation.errors
        )
      );
    }

    const updateData: any = {};
    if (validation.data.valorTotal !== undefined) {
      updateData.value = validation.data.valorTotal;
    }
    if (validation.data.dataCriacao !== undefined) {
      updateData.creationDate = new Date(validation.data.dataCriacao);
    }

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

// Deletar pedido
router.delete("/order/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId || orderId.trim() === "") {
      return res.status(400).json(
        createErrorResponse("Numero do pedido e obrigatorio")
      );
    }

    const existingOrder = await getOrderById(orderId);
    if (!existingOrder) {
      return res.status(404).json(
        createErrorResponse(`Pedido com numero ${orderId} nao encontrado`)
      );
    }

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
