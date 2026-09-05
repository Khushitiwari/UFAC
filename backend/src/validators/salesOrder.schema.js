import { z } from 'zod';

export const salesOrderStatusEnum = z.enum(['DRAFT', 'CONFIRMED', 'INVOICED']);

const salesOrderLineSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  tax: z.coerce.number().nonnegative().default(0),
});

export const createSalesOrderSchema = z.object({
  contactId: z.string().cuid(),
  date: z.coerce.date(),
  status: salesOrderStatusEnum.optional(),
  notes: z.string().max(1000).optional().nullable(),
  lines: z.array(salesOrderLineSchema).min(1, 'At least one line is required'),
});

export const updateSalesOrderSchema = z.object({
  contactId: z.string().cuid().optional(),
  date: z.coerce.date().optional(),
  status: salesOrderStatusEnum.optional(),
  notes: z.string().max(1000).optional().nullable(),
  lines: z.array(salesOrderLineSchema).min(1).optional(),
});

export const salesOrderIdParamSchema = z.object({
  id: z.string().cuid('Invalid sales order id'),
});

export const listSalesOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: salesOrderStatusEnum.optional(),
  contactId: z.string().cuid().optional(),
});
