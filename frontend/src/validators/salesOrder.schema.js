import { z } from 'zod';

export const salesOrderStatusEnum = z.enum(['DRAFT', 'CONFIRMED', 'INVOICED']);

const salesOrderLineSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unitPrice: z.coerce.number().nonnegative(),
  tax: z.coerce.number().nonnegative().default(0),
});

export const createSalesOrderSchema = z.object({
  contactId: z.string().min(1, 'Customer is required'),
  date: z.coerce.date(),
  status: salesOrderStatusEnum.optional(),
  notes: z.string().max(1000).optional().nullable(),
  lines: z.array(salesOrderLineSchema).min(1, 'At least one line is required'),
});

export const updateSalesOrderSchema = z.object({
  contactId: z.string().optional(),
  date: z.coerce.date().optional(),
  status: salesOrderStatusEnum.optional(),
  notes: z.string().max(1000).optional().nullable(),
  lines: z.array(salesOrderLineSchema).min(1).optional(),
});
