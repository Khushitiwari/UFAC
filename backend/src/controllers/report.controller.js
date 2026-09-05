import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import { getBalanceSheet, getProfitAndLoss, getBudgetReport } from '../services/report.service.js';

export const balanceSheet = asyncHandler(async (req, res) => {
  const asOfDate = req.query.asOfDate ? new Date(req.query.asOfDate) : new Date();
  const data = await getBalanceSheet(asOfDate);
  sendResponse(res, new ApiResponse(200, data));
});

export const profitAndLoss = asyncHandler(async (req, res) => {
  const startDate = new Date(req.query.startDate || `${new Date().getFullYear()}-01-01`);
  const endDate = new Date(req.query.endDate || new Date().toISOString().slice(0, 10));
  const data = await getProfitAndLoss(startDate, endDate);
  sendResponse(res, new ApiResponse(200, data));
});

export const budgetReport = asyncHandler(async (req, res) => {
  const fiscalYear = parseInt(req.query.fiscalYear, 10) || new Date().getFullYear();
  const period = req.query.period ? parseInt(req.query.period, 10) : undefined;
  const data = await getBudgetReport(fiscalYear, period);
  sendResponse(res, new ApiResponse(200, data));
});
