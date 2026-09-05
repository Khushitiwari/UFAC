import { z } from 'zod';
import { paymentMethodEnum } from './shared.schema.js';

export const createPaymentSchema = z
  .object({
    contactId: z.string().cuid(),
    billId: z.string().cuid().optional().nullable(),
    invoiceId: z.string().cuid().optional().nullable(),
    method: paymentMethodEnum,
    amount: z.coerce.number().positive(),
    date: z.coerce.date(),
    reference: z.string().max(100).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.billId && !data.invoiceId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Either billId or invoiceId is required',
        path: ['billId'],
      });
    }
    if (data.billId && data.invoiceId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Cannot specify both billId and invoiceId',
        path: ['billId'],
      });
    }
  });

export const paymentIdParamSchema = z.object({
  id: z.string().cuid('Invalid payment id'),
});

export const listPaymentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  contactId: z.string().cuid().optional(),
  method: paymentMethodEnum.optional(),
});
