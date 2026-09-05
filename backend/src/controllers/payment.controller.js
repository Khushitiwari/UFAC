import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import { assertWriteAccess } from '../utils/access.js';
import * as paymentService from '../services/payment.service.js';

export const listPayments = asyncHandler(async (req, res) => {
  const result = await paymentService.listPayments(req.query, req.user);
  sendResponse(res, new ApiResponse(200, result));
});

export const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id, req.user);
  sendResponse(res, new ApiResponse(200, payment));
});

export const createPayment = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  const payment = await paymentService.createPayment(req.body, req.user.id);
  sendResponse(res, new ApiResponse(201, payment, 'Payment created'));
});

export const deletePayment = asyncHandler(async (req, res) => {
  assertWriteAccess(req.user);
  await paymentService.deletePayment(req.params.id);
  sendResponse(res, new ApiResponse(200, null, 'Payment deleted'));
});

export default {
  listPayments,
  getPayment,
  createPayment,
  deletePayment,
};
