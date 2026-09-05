import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import { getDashboardSummary } from '../services/dashboard.service.js';

export const summary = asyncHandler(async (req, res) => {
  const data = await getDashboardSummary(req.user);
  sendResponse(res, new ApiResponse(200, { summary: data }));
});

export default { summary };
