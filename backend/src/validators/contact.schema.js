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

export const contactIdParamSchema = z.object({
  id: z.string().cuid('Invalid contact id'),
});

export const listContactsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(100).optional(),
  type: contactTypeEnum.optional(),
  status: recordStatusEnum.optional(),
});
