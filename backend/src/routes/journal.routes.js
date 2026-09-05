import { Router } from 'express';
import {
  listJournals,
  getJournal,
  createJournal,
  updateJournal,
  deleteJournal,
} from '../controllers/journal.controller.js';
import {
  listJournalEntries,
  createJournalEntry,
} from '../controllers/journalEntry.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createJournalSchema,
  updateJournalSchema,
  journalIdParamSchema,
  listJournalsQuerySchema,
} from '../validators/journal.schema.js';
import {
  createJournalEntrySchema,
  listJournalEntriesQuerySchema,
} from '../validators/journalEntry.schema.js';

const router = Router();

router.use(authenticate);

router.get('/entries', validate(listJournalEntriesQuerySchema, 'query'), listJournalEntries);
router.post(
  '/entries',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createJournalEntrySchema),
  createJournalEntry,
);

router.get('/', validate(listJournalsQuerySchema, 'query'), listJournals);
router.get('/:id', validate(journalIdParamSchema, 'params'), getJournal);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validate(createJournalSchema), createJournal);
router.put(
  '/:id',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(journalIdParamSchema, 'params'),
  validate(updateJournalSchema),
  updateJournal,
);
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validate(journalIdParamSchema, 'params'),
  deleteJournal,
);

export default router;
