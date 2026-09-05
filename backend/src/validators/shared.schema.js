import { z } from 'zod';

export const billInvoiceStatusEnum = z.enum(['UNPAID', 'PARTIAL', 'PAID']);
export const paymentMethodEnum = z.enum(['CASH', 'BANK']);
export const sourceTypeEnum = z.enum([
  'PURCHASE_ORDER',
  'SALES_ORDER',
  'VENDOR_BILL',
  'CUSTOMER_INVOICE',
  'PAYMENT',
  'MANUAL',
]);
