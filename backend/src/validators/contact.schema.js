import { z } from 'zod';

export const contactTypeEnum = z.enum(['CUSTOMER', 'VENDOR', 'BOTH']);
export const recordStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']);

export const portalUserSchema = z.object({
  password: z.string().min(8, 'Portal password must be at least 8 characters'),
  name: z.string().min(2).max(100).optional(),
});

const contactFields = {
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email'),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  type: contactTypeEnum.default('CUSTOMER'),
  taxId: z.string().max(50).optional().nullable(),
  imageUrl: z.string().max(500_000).optional().nullable(),
  status: recordStatusEnum.optional(),
};

export const createContactSchema = z.object({
  ...contactFields,
  portalUser: portalUserSchema.optional(),
});

export const updateContactSchema = z.object(contactFields).partial();

export const createPortalUserSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2).max(100).optional(),
});

export const contactIdParamSchema = z.object({
  id: z.string().min(1, 'Invalid contact id'),
});

export const listContactsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(100).optional(),
  type: contactTypeEnum.optional(),
  status: recordStatusEnum.optional(),
});
