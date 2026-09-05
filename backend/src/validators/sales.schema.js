import { z } from 'zod';
import { orderStatusEnum } from './purchase.schema.js';

export const createSalesOrderSchema = z.object({
  number: z.string().min(1).max(50),
  contactId: z.string().cuid(),
  orderDate: z.coerce.date(),
  status: orderStatusEnum.optional(),
  totalAmount: z.coerce.number().nonnegative().default(0),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateSalesOrderSchema = createSalesOrderSchema.partial().omit({ number: true });

export const createCustomerInvoiceSchema = z.object({
  number: z.string().min(1).max(50),
  contactId: z.string().cuid(),
  salesOrderId: z.string().cuid().optional().nullable(),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),
  status: z.enum(['DRAFT', 'POSTED', 'PAID', 'CANCELLED']).optional(),
  totalAmount: z.coerce.number().nonnegative().default(0),
  taxAmount: z.coerce.number().nonnegative().default(0),
});

export const updateCustomerInvoiceSchema = createCustomerInvoiceSchema.partial().omit({ number: true });
