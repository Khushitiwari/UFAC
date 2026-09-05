import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

const journalSelect = {
  id: true,
  name: true,
  type: true,
  defaultAccountId: true,
  createdAt: true,
  updatedAt: true,
  defaultAccount: {
    select: { id: true, name: true, type: true },
  },
};

export const listJournals = async (query) => {
  const { page, limit, skip, take } = getPagination({ query });
  const { search, type } = query;

  const where = {
    ...(type && { type }),
    ...(search && {
      name: { contains: search, mode: 'insensitive' },
    }),
  };

  const [journals, total] = await Promise.all([
    prisma.journal.findMany({
      where,
      select: journalSelect,
      skip,
      take,
      orderBy: { name: 'asc' },
    }),
    prisma.journal.count({ where }),
  ]);

  return { journals, meta: paginationMeta(total, page, limit) };
};

export const getJournalById = async (id) => {
  const journal = await prisma.journal.findUnique({
    where: { id },
    select: journalSelect,
  });
  if (!journal) throw new ApiError(404, 'Journal not found');
  return journal;
};

export const createJournal = async (data) => {
  if (data.defaultAccountId) {
    await prisma.account.findUniqueOrThrow({ where: { id: data.defaultAccountId } });
  }
  return prisma.journal.create({
    data,
    select: journalSelect,
  });
};

export const updateJournal = async (id, data) => {
  await getJournalById(id);
  if (data.defaultAccountId) {
    await prisma.account.findUniqueOrThrow({ where: { id: data.defaultAccountId } });
  }
  return prisma.journal.update({
    where: { id },
    data,
    select: journalSelect,
  });
};

export const deleteJournal = async (id) => {
  await getJournalById(id);
  await prisma.journal.delete({ where: { id } });
};

export default {
  listJournals,
  getJournalById,
  createJournal,
  updateJournal,
  deleteJournal,
};
