import { z } from 'zod';
import { billInvoiceStatusEnum } from './shared.schema.js';

const vendorBillLineSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unitPrice: z.coerce.number().nonnegative(),
});

export const createVendorBillSchema = z.object({
  contactId: z.string().min(1, 'Vendor is required'),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),
  lines: z.array(vendorBillLineSchema).min(1, 'At least one line is required'),
});

export const createVendorBillFromPOSchema = z.object({
  purchaseOrderId: z.string().min(1, 'Purchase order is required'),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const updateVendorBillSchema = z.object({
  invoiceDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional().nullable(),
  status: billInvoiceStatusEnum.optional(),
});

export const recordPaymentSchema = z.object({
  contactId: z.string().min(1),
  billId: z.string().optional().nullable(),
  invoiceId: z.string().optional().nullable(),
  method: z.enum(['CASH', 'BANK']),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  date: z.coerce.date(),
  reference: z.string().max(100).optional().nullable(),
});
