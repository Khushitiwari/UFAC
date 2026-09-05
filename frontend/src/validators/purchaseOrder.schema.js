import { z } from 'zod';

export const purchaseOrderStatusEnum = z.enum(['DRAFT', 'CONFIRMED', 'BILLED']);

const purchaseOrderLineSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unitPrice: z.coerce.number().nonnegative(),
});

export const createPurchaseOrderSchema = z.object({
  contactId: z.string().min(1, 'Vendor is required'),
  date: z.coerce.date(),
  status: purchaseOrderStatusEnum.optional(),
  notes: z.string().max(1000).optional().nullable(),
  lines: z.array(purchaseOrderLineSchema).min(1, 'At least one line is required'),
});

export const updatePurchaseOrderSchema = z.object({
  contactId: z.string().optional(),
  date: z.coerce.date().optional(),
  status: purchaseOrderStatusEnum.optional(),
  notes: z.string().max(1000).optional().nullable(),
  lines: z.array(purchaseOrderLineSchema).min(1).optional(),
});
