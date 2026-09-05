import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import { assertWriteAccess } from '../utils/access.js';
import * as salesOrderService from '../services/salesOrder.service.js';

export const listSalesOrders = asyncHandler(async (req, res) => {
  const result = await salesOrderService.listSalesOrders(req.query, req.user);
  sendResponse(res, new ApiResponse(200, result));
});

export const getSalesOrder = asyncHandler(async (req, res) => {
  const salesOrder = await salesOrderService.getSalesOrderById(req.params.id, req.user);
  sendResponse(res, new ApiResponse(200, salesOrder));
});

export const createSalesOrder = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  const salesOrder = await salesOrderService.createSalesOrder(req.body);
  sendResponse(res, new ApiResponse(201, salesOrder, 'Sales order created'));
});

export const updateSalesOrder = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  const salesOrder = await salesOrderService.updateSalesOrder(req.params.id, req.body);
  sendResponse(res, new ApiResponse(200, salesOrder, 'Sales order updated'));
});

export const deleteSalesOrder = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  await salesOrderService.deleteSalesOrder(req.params.id);
  sendResponse(res, new ApiResponse(200, null, 'Sales order deleted'));
});

export default {
  listSalesOrders,
  getSalesOrder,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
};
