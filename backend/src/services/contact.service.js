import bcrypt from 'bcrypt';
import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

const BCRYPT_ROUNDS = 12;

const contactSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  type: true,
  status: true,
  taxId: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  },
};

const createPortalUserInTx = async (tx, contact, portalUser) => {
  if (contact.user) {
    throw new ApiError(409, 'This contact already has a portal user');
  }

  const existingUser = await tx.user.findUnique({ where: { email: contact.email } });
  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(portalUser.password, BCRYPT_ROUNDS);

  await tx.user.create({
    data: {
      email: contact.email,
      name: portalUser.name?.trim() || contact.name,
      passwordHash,
      role: 'CONTACT',
      contactId: contact.id,
    },
  });
};

export const listContacts = async (query) => {
  const { page, limit, skip, take } = getPagination({ query });
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

export const createContact = async (data, { allowPortalUser = false } = {}) => {
  const { portalUser, ...contactData } = data;

  if (portalUser && !allowPortalUser) {
    throw new ApiError(403, 'Only admins can create portal users');
  }

  return prisma.$transaction(async (tx) => {
    const contact = await tx.contact.create({
      data: contactData,
      select: contactSelect,
    });

    if (portalUser) {
      await createPortalUserInTx(tx, contact, portalUser);
    }

    return tx.contact.findUnique({
      where: { id: contact.id },
      select: contactSelect,
    });
  });
};

export const createPortalUser = async (contactId, portalUser) => {
  return prisma.$transaction(async (tx) => {
    const contact = await tx.contact.findUnique({
      where: { id: contactId },
      select: contactSelect,
    });
    if (!contact) throw new ApiError(404, 'Contact not found');

    await createPortalUserInTx(tx, contact, portalUser);

    return tx.contact.findUnique({
      where: { id: contactId },
      select: contactSelect,
    });
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
  const contact = await getContactById(id);
  if (contact.user) {
    throw new ApiError(400, 'Remove the portal user before deleting this contact');
  }
  await prisma.contact.delete({ where: { id } });
};

export default {
  listContacts,
  getContactById,
  createContact,
  createPortalUser,
  updateContact,
  deleteContact,
};
