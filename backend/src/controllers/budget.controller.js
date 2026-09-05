import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import * as budgetService from '../services/budget.service.js';

export const listBudgets = asyncHandler(async (req, res) => {
  const result = await budgetService.listBudgets(req.query);
  sendResponse(res, new ApiResponse(200, result));
});

export const getBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.getBudgetById(req.params.id);
  sendResponse(res, new ApiResponse(200, budget));
});

export const createBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.createBudget(req.body);
  sendResponse(res, new ApiResponse(201, budget, 'Budget created'));
});

export const updateBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.updateBudget(req.params.id, req.body);
  sendResponse(res, new ApiResponse(200, budget, 'Budget updated'));
});

export const deleteBudget = asyncHandler(async (req, res) => {
  await budgetService.deleteBudget(req.params.id);
  sendResponse(res, new ApiResponse(200, null, 'Budget deleted'));
});

export default {
  listBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
};
