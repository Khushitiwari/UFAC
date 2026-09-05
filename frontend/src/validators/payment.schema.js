import { z } from 'zod';
import { paymentMethodEnum } from './shared.schema.js';

export const createPaymentSchema = z
  .object({
    contactId: z.string().min(1, 'Contact is required'),
    billId: z.string().optional().nullable(),
    invoiceId: z.string().optional().nullable(),
    method: paymentMethodEnum,
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    date: z.coerce.date(),
    reference: z.string().max(100).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.billId && !data.invoiceId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Either bill or invoice is required',
        path: ['billId'],
      });
    }
    if (data.billId && data.invoiceId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Cannot specify both bill and invoice',
        path: ['billId'],
      });
    }
  });
