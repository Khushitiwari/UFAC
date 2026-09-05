import { z } from 'zod';

export const purchaseOrderStatusEnum = z.enum(['DRAFT', 'CONFIRMED', 'BILLED']);

const purchaseOrderLineSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
});

export const createPurchaseOrderSchema = z.object({
  contactId: z.string().cuid(),
  date: z.coerce.date(),
  status: purchaseOrderStatusEnum.optional(),
  notes: z.string().max(1000).optional().nullable(),
  lines: z.array(purchaseOrderLineSchema).min(1, 'At least one line is required'),
});

export const updatePurchaseOrderSchema = z.object({
  contactId: z.string().cuid().optional(),
  date: z.coerce.date().optional(),
  status: purchaseOrderStatusEnum.optional(),
  notes: z.string().max(1000).optional().nullable(),
  lines: z.array(purchaseOrderLineSchema).min(1).optional(),
});

export const purchaseOrderIdParamSchema = z.object({
  id: z.string().cuid('Invalid purchase order id'),
});

export const listPurchaseOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: purchaseOrderStatusEnum.optional(),
  contactId: z.string().cuid().optional(),
});
