import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import { assertWriteAccess } from '../utils/access.js';
import * as customerInvoiceService from '../services/customerInvoice.service.js';

export const listCustomerInvoices = asyncHandler(async (req, res) => {
  const result = await customerInvoiceService.listCustomerInvoices(req.query, req.user);
  sendResponse(res, new ApiResponse(200, result));
});

export const getCustomerInvoice = asyncHandler(async (req, res) => {
  const customerInvoice = await customerInvoiceService.getCustomerInvoiceById(
    req.params.id,
    req.user,
  );
  sendResponse(res, new ApiResponse(200, customerInvoice));
});

export const createCustomerInvoice = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  const customerInvoice = await customerInvoiceService.createCustomerInvoice(
    req.body,
    req.user.id,
  );
  sendResponse(res, new ApiResponse(201, customerInvoice, 'Customer invoice created'));
});

export const createCustomerInvoiceFromSalesOrder = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  const customerInvoice = await customerInvoiceService.createCustomerInvoiceFromSalesOrder(
    req.body,
    req.user.id,
  );
  sendResponse(res, new ApiResponse(201, customerInvoice, 'Customer invoice created from sales order'));
});

export const updateCustomerInvoice = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  const customerInvoice = await customerInvoiceService.updateCustomerInvoice(
    req.params.id,
    req.body,
  );
  sendResponse(res, new ApiResponse(200, customerInvoice, 'Customer invoice updated'));
});

export const deleteCustomerInvoice = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  await customerInvoiceService.deleteCustomerInvoice(req.params.id);
  sendResponse(res, new ApiResponse(200, null, 'Customer invoice deleted'));
});

export default {
  listCustomerInvoices,
  getCustomerInvoice,
  createCustomerInvoice,
  createCustomerInvoiceFromSalesOrder,
  updateCustomerInvoice,
  deleteCustomerInvoice,
};
