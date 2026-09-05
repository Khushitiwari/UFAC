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

export const createContactSchema = z
  .object({
    ...contactFields,
    createPortalUser: z.boolean().optional(),
    portalPassword: z.string().optional(),
    portalUserName: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.createPortalUser) {
      if (!data.portalPassword || data.portalPassword.length < 8) {
        ctx.addIssue({
          code: 'custom',
          message: 'Portal password must be at least 8 characters',
          path: ['portalPassword'],
        });
      }
    }
  });

export const createPortalUserSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2).max(100).optional(),
});

export const updateContactSchema = z.object(contactFields).partial();

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const toContactPayload = (form, { includePortalUser = false } = {}) => {
  const addressParts = [form.street, form.city, form.state, form.country, form.pincode].filter(Boolean);
  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone?.trim() || null,
    address: addressParts.length ? addressParts.join(', ') : form.address?.trim() || null,
    type: form.type,
    taxId: form.taxId?.trim() || null,
    imageUrl: form.imageUrl || null,
  };

  if (includePortalUser && form.createPortalUser) {
    payload.portalUser = {
      password: form.portalPassword,
      ...(form.portalUserName?.trim() ? { name: form.portalUserName.trim() } : {}),
    };
  }

  return payload;
};

export const parseAddressFields = (address = '') => {
  const parts = address.split(',').map((p) => p.trim());
  return {
    street: parts[0] || '',
    city: parts[1] || '',
    state: parts[2] || '',
    country: parts[3] || '',
    pincode: parts[4] || '',
    address,
  };
};
