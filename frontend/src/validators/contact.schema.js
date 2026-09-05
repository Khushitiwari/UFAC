import { z } from 'zod';

export const contactTypeEnum = z.enum(['CUSTOMER', 'VENDOR', 'BOTH']);
export const recordStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']);

export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email'),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  type: contactTypeEnum.default('CUSTOMER'),
  taxId: z.string().max(50).optional().nullable(),
  status: recordStatusEnum.optional(),
});

export const updateContactSchema = createContactSchema.partial();

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
