import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import { assertWriteAccess } from '../utils/access.js';
import * as purchaseOrderService from '../services/purchaseOrder.service.js';

export const listPurchaseOrders = asyncHandler(async (req, res) => {
  const result = await purchaseOrderService.listPurchaseOrders(req.query, req.user);
  sendResponse(res, new ApiResponse(200, result));
});

export const getPurchaseOrder = asyncHandler(async (req, res) => {
  const purchaseOrder = await purchaseOrderService.getPurchaseOrderById(req.params.id, req.user);
  sendResponse(res, new ApiResponse(200, purchaseOrder));
});

export const createPurchaseOrder = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  const purchaseOrder = await purchaseOrderService.createPurchaseOrder(req.body);
  sendResponse(res, new ApiResponse(201, purchaseOrder, 'Purchase order created'));
});

export const updatePurchaseOrder = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  const purchaseOrder = await purchaseOrderService.updatePurchaseOrder(req.params.id, req.body);
  sendResponse(res, new ApiResponse(200, purchaseOrder, 'Purchase order updated'));
});

export const deletePurchaseOrder = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  await purchaseOrderService.deletePurchaseOrder(req.params.id);
  sendResponse(res, new ApiResponse(200, null, 'Purchase order deleted'));
});

export default {
  listPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
};
