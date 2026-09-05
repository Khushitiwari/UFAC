import { z } from 'zod';
import { billInvoiceStatusEnum } from './shared.schema.js';

const vendorBillLineSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
});

export const createVendorBillSchema = z.object({
  contactId: z.string().cuid(),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),
  lines: z.array(vendorBillLineSchema).min(1, 'At least one line is required'),
});

export const createVendorBillFromPOSchema = z.object({
  purchaseOrderId: z.string().cuid(),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const updateVendorBillSchema = z.object({
  invoiceDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional().nullable(),
  status: billInvoiceStatusEnum.optional(),
});

export const vendorBillIdParamSchema = z.object({
  id: z.string().cuid('Invalid vendor bill id'),
});

export const listVendorBillsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: billInvoiceStatusEnum.optional(),
  contactId: z.string().cuid().optional(),
});
