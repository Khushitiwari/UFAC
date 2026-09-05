import { z } from 'zod';
import { billInvoiceStatusEnum } from './shared.schema.js';

const customerInvoiceLineSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unitPrice: z.coerce.number().nonnegative(),
  tax: z.coerce.number().nonnegative().default(0),
});

export const createCustomerInvoiceSchema = z.object({
  contactId: z.string().min(1, 'Customer is required'),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),
  lines: z.array(customerInvoiceLineSchema).min(1, 'At least one line is required'),
});

export const createCustomerInvoiceFromSOSchema = z.object({
  salesOrderId: z.string().min(1, 'Sales order is required'),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const updateCustomerInvoiceSchema = z.object({
  invoiceDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional().nullable(),
  status: billInvoiceStatusEnum.optional(),
});
