import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import { assertWriteAccess } from '../utils/access.js';
import * as vendorBillService from '../services/vendorBill.service.js';

export const listVendorBills = asyncHandler(async (req, res) => {
  const result = await vendorBillService.listVendorBills(req.query, req.user);
  sendResponse(res, new ApiResponse(200, result));
});

export const getVendorBill = asyncHandler(async (req, res) => {
  const vendorBill = await vendorBillService.getVendorBillById(req.params.id, req.user);
  sendResponse(res, new ApiResponse(200, vendorBill));
});

export const createVendorBill = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  const vendorBill = await vendorBillService.createVendorBill(req.body, req.user.id);
  sendResponse(res, new ApiResponse(201, vendorBill, 'Vendor bill created'));
});

export const createVendorBillFromPurchaseOrder = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  const vendorBill = await vendorBillService.createVendorBillFromPurchaseOrder(
    req.body,
    req.user.id,
  );
  sendResponse(res, new ApiResponse(201, vendorBill, 'Vendor bill created from purchase order'));
});

export const updateVendorBill = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  const vendorBill = await vendorBillService.updateVendorBill(req.params.id, req.body);
  sendResponse(res, new ApiResponse(200, vendorBill, 'Vendor bill updated'));
});

export const deleteVendorBill = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  await vendorBillService.deleteVendorBill(req.params.id);
  sendResponse(res, new ApiResponse(200, null, 'Vendor bill deleted'));
});

export default {
  listVendorBills,
  getVendorBill,
  createVendorBill,
  createVendorBillFromPurchaseOrder,
  updateVendorBill,
  deleteVendorBill,
};
