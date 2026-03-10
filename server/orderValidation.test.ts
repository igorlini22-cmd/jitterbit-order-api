import { describe, expect, it } from "vitest";
import {
  validateIncomingOrder,
  validateUpdateOrder,
  transformOrderData,
  transformOrderForResponse,
} from "./orderValidation";

describe("Order Validation", () => {
  describe("validateIncomingOrder", () => {
    it("should validate a correct order", () => {
      const validOrder = {
        numeroPedido: "v10089015vdb-01",
        valorTotal: 10000,
        dataCriacao: "2023-07-19T12:24:11.529Z",
        items: [
          {
            idItem: "2434",
            quantidadeItem: 1,
            valorItem: 1000,
          },
        ],
      };

      const result = validateIncomingOrder(validOrder);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.numeroPedido).toBe("v10089015vdb-01");
        expect(result.data.valorTotal).toBe(10000);
      }
    });

    it("should reject order with missing numeroPedido", () => {
      const invalidOrder = {
        valorTotal: 10000,
        dataCriacao: "2023-07-19T12:24:11.529Z",
        items: [
          {
            idItem: "2434",
            quantidadeItem: 1,
            valorItem: 1000,
          },
        ],
      };

      const result = validateIncomingOrder(invalidOrder);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toBeDefined();
      }
    });

    it("should reject order with negative valorTotal", () => {
      const invalidOrder = {
        numeroPedido: "v10089015vdb-01",
        valorTotal: -100,
        dataCriacao: "2023-07-19T12:24:11.529Z",
        items: [
          {
            idItem: "2434",
            quantidadeItem: 1,
            valorItem: 1000,
          },
        ],
      };

      const result = validateIncomingOrder(invalidOrder);
      expect(result.valid).toBe(false);
    });

    it("should reject order with empty items array", () => {
      const invalidOrder = {
        numeroPedido: "v10089015vdb-01",
        valorTotal: 10000,
        dataCriacao: "2023-07-19T12:24:11.529Z",
        items: [],
      };

      const result = validateIncomingOrder(invalidOrder);
      expect(result.valid).toBe(false);
    });

    it("should reject order with invalid date format", () => {
      const invalidOrder = {
        numeroPedido: "v10089015vdb-01",
        valorTotal: 10000,
        dataCriacao: "invalid-date",
        items: [
          {
            idItem: "2434",
            quantidadeItem: 1,
            valorItem: 1000,
          },
        ],
      };

      const result = validateIncomingOrder(invalidOrder);
      expect(result.valid).toBe(false);
    });
  });

  describe("validateUpdateOrder", () => {
    it("should validate partial update with valorTotal", () => {
      const updateData = {
        valorTotal: 15000,
      };

      const result = validateUpdateOrder(updateData);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.valorTotal).toBe(15000);
      }
    });

    it("should validate empty update object", () => {
      const updateData = {};

      const result = validateUpdateOrder(updateData);
      expect(result.valid).toBe(true);
    });

    it("should reject update with negative valorTotal", () => {
      const updateData = {
        valorTotal: -100,
      };

      const result = validateUpdateOrder(updateData);
      expect(result.valid).toBe(false);
    });
  });

  describe("transformOrderData", () => {
    it("should transform order data correctly", () => {
      const incomingOrder = {
        numeroPedido: "v10089015vdb-01",
        valorTotal: 10000,
        dataCriacao: "2023-07-19T12:24:11.529Z",
        items: [
          {
            idItem: "2434",
            quantidadeItem: 1,
            valorItem: 1000,
          },
          {
            idItem: "5678",
            quantidadeItem: 2,
            valorItem: 4500,
          },
        ],
      };

      const transformed = transformOrderData(incomingOrder);

      expect(transformed.orderId).toBe("v10089015vdb-01");
      expect(transformed.value).toBe(10000);
      expect(transformed.creationDate).toEqual(
        new Date("2023-07-19T12:24:11.529Z")
      );
      expect(transformed.items).toHaveLength(2);
      expect(transformed.items[0]).toEqual({
        productId: 2434,
        quantity: 1,
        price: 1000,
      });
      expect(transformed.items[1]).toEqual({
        productId: 5678,
        quantity: 2,
        price: 4500,
      });
    });
  });

  describe("transformOrderForResponse", () => {
    it("should transform database order to response format", () => {
      const dbOrder = {
        orderId: "v10089015vdb-01",
        value: 10000,
        creationDate: new Date("2023-07-19T12:24:11.529Z"),
        updatedAt: new Date(),
      };

      const dbItems = [
        {
          id: 1,
          orderId: "v10089015vdb-01",
          productId: 2434,
          quantity: 1,
          price: 1000,
          createdAt: new Date(),
        },
      ];

      const response = transformOrderForResponse(dbOrder, dbItems);

      expect(response.orderId).toBe("v10089015vdb-01");
      expect(response.value).toBe(10000);
      expect(response.items).toHaveLength(1);
      expect(response.items[0]).toEqual({
        productId: 2434,
        quantity: 1,
        price: 1000,
      });
    });
  });
});
