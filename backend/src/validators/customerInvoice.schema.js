import { z } from 'zod';
import { billInvoiceStatusEnum } from './shared.schema.js';

const customerInvoiceLineSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  tax: z.coerce.number().nonnegative().default(0),
});

export const createCustomerInvoiceSchema = z.object({
  contactId: z.string().cuid(),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),
  lines: z.array(customerInvoiceLineSchema).min(1, 'At least one line is required'),
});

export const createCustomerInvoiceFromSOSchema = z.object({
  salesOrderId: z.string().cuid(),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const updateCustomerInvoiceSchema = z.object({
  invoiceDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional().nullable(),
  status: billInvoiceStatusEnum.optional(),
});

export const customerInvoiceIdParamSchema = z.object({
  id: z.string().cuid('Invalid customer invoice id'),
});

export const listCustomerInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: billInvoiceStatusEnum.optional(),
  contactId: z.string().cuid().optional(),
});
