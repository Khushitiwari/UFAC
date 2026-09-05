import { z } from 'zod';

export const paymentTypeEnum = z.enum(['INBOUND', 'OUTBOUND']);
export const paymentStatusEnum = z.enum(['DRAFT', 'POSTED', 'RECONCILED', 'CANCELLED']);

export const createPaymentSchema = z.object({
  number: z.string().min(1).max(50),
  contactId: z.string().cuid(),
  paymentDate: z.coerce.date(),
  amount: z.coerce.number().positive(),
  type: paymentTypeEnum,
  status: paymentStatusEnum.optional(),
  customerInvoiceId: z.string().cuid().optional().nullable(),
  vendorBillId: z.string().cuid().optional().nullable(),
  reference: z.string().max(100).optional().nullable(),
});

export const updatePaymentSchema = createPaymentSchema.partial().omit({ number: true });

export const paymentIdParamSchema = z.object({
  id: z.string().cuid(),
});
