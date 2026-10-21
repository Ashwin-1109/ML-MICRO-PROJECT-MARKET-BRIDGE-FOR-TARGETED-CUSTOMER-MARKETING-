# MarketBridge AI — Data Model Specification

## 1. Relational & Local Entities

### `products`
- `id` (string / UUID, primary key)
- `storeId` (string, foreign key to stores)
- `sku` (string, unique within store)
- `title` (string)
- `description` (string)
- `category` (string, e.g. Audio, Kitchen & Coffee, Desk & Tech)
- `price` (number, retail price)
- `cost` (number, unit cost of goods sold)
- `stock` (number, current available physical units)
- `stockThreshold` (number, low stock trigger boundary)
- `imageUrl` (string)
- `active` (boolean)

### `inventory_movements` (Append-Only Audit Ledger)
- `id` (string / UUID, primary key)
- `storeId` (string)
- `productId` (string, foreign key to products)
- `productTitle` (string)
- `movementType` ('initial' | 'sale' | 'restock' | 'adjustment' | 'refund' | 'damage')
- `quantityDelta` (number, signed integer delta)
- `previousStock` (number)
- `newStock` (number)
- `referenceId` (string, orderId or adjustment receipt)
- `notes` (string)
- `timestamp` (ISO-8601 string)

### `customers`
- `id` (string / UUID, primary key)
- `storeId` (string)
- `name` (string)
- `email` (string)
- `phone` (string)
- `segmentId` (string, e.g. seg_high_value, seg_at_risk)
- `segmentName` (string)
- `recencyDays` (number, days since latest completed purchase)
- `frequency` (number, total orders count)
- `monetaryTotal` (number, cumulative spend)
- `averageOrderValue` (number)
- `riskScore` (number, 0 to 100, predicted 90-day churn probability * 100)
- `riskBand` ('Low' | 'Medium' | 'High')
- `marketingConsent` (boolean, opt-in status)

### `orders` & `order_items`
- `orders.id` (string, e.g. ord_1001)
- `orders.customerId` (string, foreign key or 'cust_guest')
- `orders.subtotal`, `orders.discount`, `orders.total`
- `orders.status` ('completed' | 'pending' | 'cancelled')
- `order_items`: line items with `productId`, `sku`, `quantity`, `unitPrice`, and `lineTotal`.

### `campaigns`
- `id` (string, primary key)
- `title`, `objective` ('winback_churn' | 'excess_inventory' | 'loyalty_reward' | 'cross_sell')
- `targetSegment`, `targetRiskBand`
- `discountPercent`, `promoCode`
- `messageDraft` (Gemini-generated luxury copywriting)
- `channel` ('in_app' | 'email_draft')
- `targetCount`, `redemptionsCount`, `revenueGenerated`
