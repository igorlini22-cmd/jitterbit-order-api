import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// ORDER MANAGEMENT QUERIES
// ============================================================================

/**
 * Create a new order with its items.
 * @param order - Order data to insert
 * @param orderItems - Array of items for the order
 * @returns The created order
 */
export async function createOrder(
  order: InsertOrder,
  orderItems: Array<{ productId: number; quantity: number; price: number }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Insert the order
    await db.insert(orders).values(order);

    // Insert items for the order
    if (orderItems.length > 0) {
      const itemsToInsert = orderItems.map((item) => ({
        orderId: order.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));
      await db.insert(items).values(itemsToInsert);
    }

    return order;
  } catch (error) {
    console.error("[Database] Failed to create order:", error);
    throw error;
  }
}

/**
 * Get a specific order by orderId.
 * @param orderId - The order ID to retrieve
 * @returns Order with its items, or undefined if not found
 */
export async function getOrderById(orderId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, orderId))
      .limit(1);

    if (order.length === 0) return undefined;

    const orderItems = await db
      .select()
      .from(items)
      .where(eq(items.orderId, orderId));

    return {
      ...order[0],
      items: orderItems,
    };
  } catch (error) {
    console.error("[Database] Failed to get order:", error);
    throw error;
  }
}

/**
 * Get all orders with their items.
 * @returns Array of all orders with items
 */
export async function getAllOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const allOrders = await db.select().from(orders);

    const ordersWithItems = await Promise.all(
      allOrders.map(async (order) => {
        const orderItems = await db
          .select()
          .from(items)
          .where(eq(items.orderId, order.orderId));
        return {
          ...order,
          items: orderItems,
        };
      })
    );

    return ordersWithItems;
  } catch (error) {
    console.error("[Database] Failed to get all orders:", error);
    throw error;
  }
}

/**
 * Update an existing order.
 * @param orderId - The order ID to update
 * @param updates - Fields to update
 * @returns The updated order
 */
export async function updateOrder(
  orderId: string,
  updates: Partial<InsertOrder>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .update(orders)
      .set(updates)
      .where(eq(orders.orderId, orderId));

    return getOrderById(orderId);
  } catch (error) {
    console.error("[Database] Failed to update order:", error);
    throw error;
  }
}

/**
 * Delete an order and its items.
 * @param orderId - The order ID to delete
 */
export async function deleteOrder(orderId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Delete items first (foreign key constraint)
    await db.delete(items).where(eq(items.orderId, orderId));

    // Delete the order
    await db.delete(orders).where(eq(orders.orderId, orderId));
  } catch (error) {
    console.error("[Database] Failed to delete order:", error);
    throw error;
  }
}

// Import the new types and tables
import { items, orders, type InsertOrder } from "../drizzle/schema";
