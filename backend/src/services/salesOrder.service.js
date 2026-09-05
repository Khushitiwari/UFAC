import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { contactScope } from '../utils/access.js';

const salesOrderInclude = {
  contact: { select: { id: true, name: true, email: true, type: true } },
  lines: {
    include: {
      product: { select: { id: true, name: true, type: true } },
    },
  },
};

const assertCustomerContact = async (contactId) => {
  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact) throw new ApiError(404, 'Contact not found');
  if (!['CUSTOMER', 'BOTH'].includes(contact.type)) {
    throw new ApiError(400, 'Contact must be a customer');
  }
  return contact;
};

export const listSalesOrders = async (query, user) => {
  const { page, limit, skip, take } = getPagination({ query });
  const { status, contactId } = query;

  const where = {
    ...contactScope(user),
    ...(status && { status }),
    ...(contactId && { contactId }),
  };

  const [salesOrders, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where,
      include: salesOrderInclude,
      skip,
      take,
      orderBy: { date: 'desc' },
    }),
    prisma.salesOrder.count({ where }),
  ]);

  return { salesOrders, meta: paginationMeta(total, page, limit) };
};

export const getSalesOrderById = async (id, user) => {
  const salesOrder = await prisma.salesOrder.findFirst({
    where: { id, ...contactScope(user) },
    include: salesOrderInclude,
  });
  if (!salesOrder) throw new ApiError(404, 'Sales order not found');
  return salesOrder;
};

export const createSalesOrder = async (data) => {
  const { lines, ...orderData } = data;
  await assertCustomerContact(orderData.contactId);

  for (const line of lines) {
    await prisma.product.findUniqueOrThrow({ where: { id: line.productId } });
  }

  return prisma.$transaction(async (tx) => {
    return tx.salesOrder.create({
      data: {
        ...orderData,
        lines: { create: lines },
      },
      include: salesOrderInclude,
    });
  });
};

export const updateSalesOrder = async (id, data) => {
  const existing = await prisma.salesOrder.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Sales order not found');
  if (existing.status === 'INVOICED') {
    throw new ApiError(400, 'Cannot update an invoiced sales order');
  }

  const { lines, ...orderData } = data;
  if (orderData.contactId) await assertCustomerContact(orderData.contactId);

  return prisma.$transaction(async (tx) => {
    if (lines) {
      await tx.salesOrderLine.deleteMany({ where: { salesOrderId: id } });
      for (const line of lines) {
        await tx.product.findUniqueOrThrow({ where: { id: line.productId } });
      }
    }

    return tx.salesOrder.update({
      where: { id },
      data: {
        ...orderData,
        ...(lines && { lines: { create: lines } }),
      },
      include: salesOrderInclude,
    });
  });
};

export const deleteSalesOrder = async (id) => {
  const existing = await prisma.salesOrder.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Sales order not found');
  if (existing.status === 'INVOICED') {
    throw new ApiError(400, 'Cannot delete an invoiced sales order');
  }
  await prisma.salesOrder.delete({ where: { id } });
};

export default {
  listSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
};
