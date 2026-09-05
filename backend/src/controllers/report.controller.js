import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import {
  getBalanceSheet,
  getProfitAndLoss,
  getBudgetVariance,
} from '../services/report.service.js';

export const balanceSheet = asyncHandler(async (req, res) => {
  const asOfDate = req.query.date ? new Date(req.query.date) : new Date();
  const data = await getBalanceSheet(asOfDate);
  sendResponse(res, new ApiResponse(200, data));
});

export const profitLoss = asyncHandler(async (req, res) => {
  const startDate = new Date(req.query.start || `${new Date().getFullYear()}-01-01`);
  const endDate = new Date(req.query.end || new Date().toISOString().slice(0, 10));
  const data = await getProfitAndLoss(startDate, endDate);
  sendResponse(res, new ApiResponse(200, data));
});

export const budgetReport = asyncHandler(async (req, res) => {
  const { periodStart, periodEnd } = req.query;
  const data = await getBudgetVariance(new Date(periodStart), new Date(periodEnd));
  sendResponse(res, new ApiResponse(200, data));
});

export default { balanceSheet, profitLoss, budgetReport };
