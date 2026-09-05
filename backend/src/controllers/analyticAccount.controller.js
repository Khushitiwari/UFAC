import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import * as analyticAccountService from '../services/analyticAccount.service.js';

export const listAnalyticAccounts = asyncHandler(async (req, res) => {
  const result = await analyticAccountService.listAnalyticAccounts(req.query);
  sendResponse(res, new ApiResponse(200, result));
});

export const getAnalyticAccount = asyncHandler(async (req, res) => {
  const analyticAccount = await analyticAccountService.getAnalyticAccountById(req.params.id);
  sendResponse(res, new ApiResponse(200, analyticAccount));
});

export const createAnalyticAccount = asyncHandler(async (req, res) => {
  const analyticAccount = await analyticAccountService.createAnalyticAccount(req.body);
  sendResponse(res, new ApiResponse(201, analyticAccount, 'Analytic account created'));
});

export const updateAnalyticAccount = asyncHandler(async (req, res) => {
  const analyticAccount = await analyticAccountService.updateAnalyticAccount(
    req.params.id,
    req.body,
  );
  sendResponse(res, new ApiResponse(200, analyticAccount, 'Analytic account updated'));
});

export const deleteAnalyticAccount = asyncHandler(async (req, res) => {
  await analyticAccountService.deleteAnalyticAccount(req.params.id);
  sendResponse(res, new ApiResponse(200, null, 'Analytic account deleted'));
});

export default {
  listAnalyticAccounts,
  getAnalyticAccount,
  createAnalyticAccount,
  updateAnalyticAccount,
  deleteAnalyticAccount,
};
