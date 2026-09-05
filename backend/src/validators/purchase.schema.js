import { z } from 'zod';

export const orderStatusEnum = z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED', 'COMPLETED']);

export const createPurchaseOrderSchema = z.object({
  number: z.string().min(1).max(50),
  contactId: z.string().cuid(),
  orderDate: z.coerce.date(),
  status: orderStatusEnum.optional(),
  totalAmount: z.coerce.number().nonnegative().default(0),
  notes: z.string().max(1000).optional().nullable(),
});

export const updatePurchaseOrderSchema = createPurchaseOrderSchema.partial().omit({ number: true });

export const createVendorBillSchema = z.object({
  number: z.string().min(1).max(50),
  contactId: z.string().cuid(),
  purchaseOrderId: z.string().cuid().optional().nullable(),
  billDate: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),
  status: z.enum(['DRAFT', 'POSTED', 'PAID', 'CANCELLED']).optional(),
  totalAmount: z.coerce.number().nonnegative().default(0),
  taxAmount: z.coerce.number().nonnegative().default(0),
});

export const updateVendorBillSchema = createVendorBillSchema.partial().omit({ number: true });
