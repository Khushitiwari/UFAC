import { Router } from 'express';
import {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contact.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createContactSchema,
  updateContactSchema,
  contactIdParamSchema,
  listContactsQuerySchema,
} from '../validators/contact.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listContactsQuerySchema, 'query'), listContacts);
router.get('/:id', validate(contactIdParamSchema, 'params'), getContact);
router.post(
  '/',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createContactSchema),
  createContact,
);
router.put(
  '/:id',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(contactIdParamSchema, 'params'),
  validate(updateContactSchema),
  updateContact,
);
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validate(contactIdParamSchema, 'params'),
  deleteContact,
);

export default router;
