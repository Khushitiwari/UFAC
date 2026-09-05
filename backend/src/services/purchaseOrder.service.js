import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { contactScope } from '../utils/access.js';

const purchaseOrderInclude = {
  contact: { select: { id: true, name: true, email: true, type: true } },
  lines: {
    include: {
      product: { select: { id: true, name: true, type: true } },
    },
  },
};

const assertVendorContact = async (contactId) => {
  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact) throw new ApiError(404, 'Contact not found');
  if (!['VENDOR', 'BOTH'].includes(contact.type)) {
    throw new ApiError(400, 'Contact must be a vendor');
  }
  return contact;
};

export const listPurchaseOrders = async (query, user) => {
  const { page, limit, skip, take } = getPagination({ query });
  const { status, contactId } = query;

  const where = {
    ...contactScope(user),
    ...(status && { status }),
    ...(contactId && { contactId }),
  };

  const [purchaseOrders, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      include: purchaseOrderInclude,
      skip,
      take,
      orderBy: { date: 'desc' },
    }),
    prisma.purchaseOrder.count({ where }),
  ]);

  return { purchaseOrders, meta: paginationMeta(total, page, limit) };
};

export const getPurchaseOrderById = async (id, user) => {
  const purchaseOrder = await prisma.purchaseOrder.findFirst({
    where: { id, ...contactScope(user) },
    include: purchaseOrderInclude,
  });
  if (!purchaseOrder) throw new ApiError(404, 'Purchase order not found');
  return purchaseOrder;
};

export const createPurchaseOrder = async (data) => {
  const { lines, ...orderData } = data;
  await assertVendorContact(orderData.contactId);

  for (const line of lines) {
    await prisma.product.findUniqueOrThrow({ where: { id: line.productId } });
  }

  return prisma.$transaction(async (tx) => {
    return tx.purchaseOrder.create({
      data: {
        ...orderData,
        lines: { create: lines },
      },
      include: purchaseOrderInclude,
    });
  });
};

export const updatePurchaseOrder = async (id, data) => {
  const existing = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { vendorBills: { select: { id: true } } },
  });
  if (!existing) throw new ApiError(404, 'Purchase order not found');
  if (existing.status === 'BILLED') {
    throw new ApiError(400, 'Cannot update a billed purchase order');
  }

  const { lines, ...orderData } = data;
  if (orderData.contactId) await assertVendorContact(orderData.contactId);

  return prisma.$transaction(async (tx) => {
    if (lines) {
      await tx.purchaseOrderLine.deleteMany({ where: { purchaseOrderId: id } });
      for (const line of lines) {
        await tx.product.findUniqueOrThrow({ where: { id: line.productId } });
      }
    }

    return tx.purchaseOrder.update({
      where: { id },
      data: {
        ...orderData,
        ...(lines && { lines: { create: lines } }),
      },
      include: purchaseOrderInclude,
    });
  });
};

export const deletePurchaseOrder = async (id) => {
  const existing = await prisma.purchaseOrder.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Purchase order not found');
  if (existing.status === 'BILLED') {
    throw new ApiError(400, 'Cannot delete a billed purchase order');
  }
  await prisma.purchaseOrder.delete({ where: { id } });
};

export default {
  listPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
};
