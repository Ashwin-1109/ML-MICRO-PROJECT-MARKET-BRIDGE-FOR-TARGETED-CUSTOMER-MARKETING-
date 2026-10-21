/**
 * MarketBridge AI — Supabase Cloud Sync & Auth Client
 * Provides optional cloud synchronization for PostgreSQL backing store while
 * preserving local-first IndexedDB (Dexie.js) as the primary offline-capable engine.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Product, Customer, Order, InventoryMovement } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  try {
    client = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(client);
}

export function getSupabaseClient(): SupabaseClient | null {
  return client;
}

/**
 * Sync product mutations to Supabase PostgreSQL table with tenant isolation
 */
export async function syncProductToCloud(product: Product): Promise<boolean> {
  if (!client) return false;
  try {
    const { error } = await client.from('products').upsert({
      id: product.id,
      store_id: product.storeId,
      sku: product.sku,
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      stock_threshold: product.stockThreshold,
      image_url: product.imageUrl,
      active: product.active,
      updated_at: product.updatedAt,
    });
    if (error) {
      console.warn('Supabase product sync warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase product sync error:', err);
    return false;
  }
}

/**
 * Sync completed orders to Supabase PostgreSQL orders and order_items tables
 */
export async function syncOrderToCloud(order: Order): Promise<boolean> {
  if (!client) return false;
  try {
    const { error: orderError } = await client.from('orders').upsert({
      id: order.id,
      store_id: order.storeId,
      customer_id: order.customerId,
      status: order.status,
      subtotal: order.subtotal,
      discount: order.discount,
      total: order.total,
      payment_method: order.paymentMethod,
      notes: order.notes,
      ordered_at: order.orderedAt,
    });

    if (orderError) {
      console.warn('Supabase order sync warning:', orderError.message);
      return false;
    }

    if (order.items && order.items.length > 0) {
      const itemsPayload = order.items.map((i) => ({
        id: i.id,
        order_id: order.id,
        product_id: i.productId,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        unit_cost: i.unitCost,
        line_total: i.lineTotal,
      }));
      await client.from('order_items').upsert(itemsPayload);
    }

    return true;
  } catch (err) {
    console.warn('Supabase order sync error:', err);
    return false;
  }
}

/**
 * Sync inventory ledger movement to Supabase
 */
export async function syncInventoryMovementToCloud(mov: InventoryMovement): Promise<boolean> {
  if (!client) return false;
  try {
    const { error } = await client.from('inventory_movements').insert({
      id: mov.id,
      store_id: mov.storeId,
      product_id: mov.productId,
      movement_type: mov.movementType,
      quantity_delta: mov.quantityDelta,
      previous_stock: mov.previousStock,
      new_stock: mov.newStock,
      reference_id: mov.referenceId,
      timestamp: mov.timestamp,
    });
    return !error;
  } catch (err) {
    console.warn('Supabase inventory movement sync error:', err);
    return false;
  }
}
