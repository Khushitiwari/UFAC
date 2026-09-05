import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import * as accountService from '../services/account.service.js';

export const listAccounts = asyncHandler(async (req, res) => {
  const result = await accountService.listAccounts(req.query);
  sendResponse(res, new ApiResponse(200, result));
});

export const getAccount = asyncHandler(async (req, res) => {
  const account = await accountService.getAccountById(req.params.id);
  sendResponse(res, new ApiResponse(200, account));
});

export const createAccount = asyncHandler(async (req, res) => {
  const account = await accountService.createAccount(req.body);
  sendResponse(res, new ApiResponse(201, account, 'Account created'));
});

export const updateAccount = asyncHandler(async (req, res) => {
  const account = await accountService.updateAccount(req.params.id, req.body);
  sendResponse(res, new ApiResponse(200, account, 'Account updated'));
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await accountService.deleteAccount(req.params.id);
  sendResponse(res, new ApiResponse(200, null, 'Account deleted'));
});

export default {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
};
