import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

const contactSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  type: true,
  status: true,
  taxId: true,
  createdAt: true,
  updatedAt: true,
};

export const listContacts = async (query) => {
  const { page, limit, skip, take } = getPagination({ query: query });
  const { search, type, status } = query;

  const where = {
    ...(type && { type }),
    ...(status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      select: contactSelect,
      skip,
      take,
      orderBy: { name: 'asc' },
    }),
    prisma.contact.count({ where }),
  ]);

  return { contacts, meta: paginationMeta(total, page, limit) };
};

export const getContactById = async (id) => {
  const contact = await prisma.contact.findUnique({
    where: { id },
    select: contactSelect,
  });

  if (!contact) throw new ApiError(404, 'Contact not found');
  return contact;
};

export const createContact = async (data) => {
  return prisma.contact.create({
    data,
    select: contactSelect,
  });
};

export const updateContact = async (id, data) => {
  await getContactById(id);
  return prisma.contact.update({
    where: { id },
    data,
    select: contactSelect,
  });
};

export const deleteContact = async (id) => {
  await getContactById(id);
  await prisma.contact.delete({ where: { id } });
};

export default {
  listContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
