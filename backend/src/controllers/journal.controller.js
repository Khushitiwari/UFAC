import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import * as journalService from '../services/journal.service.js';

export const listJournals = asyncHandler(async (req, res) => {
  const result = await journalService.listJournals(req.query);
  sendResponse(res, new ApiResponse(200, result));
});

export const getJournal = asyncHandler(async (req, res) => {
  const journal = await journalService.getJournalById(req.params.id);
  sendResponse(res, new ApiResponse(200, journal));
});

export const createJournal = asyncHandler(async (req, res) => {
  const journal = await journalService.createJournal(req.body);
  sendResponse(res, new ApiResponse(201, journal, 'Journal created'));
});

export const updateJournal = asyncHandler(async (req, res) => {
  const journal = await journalService.updateJournal(req.params.id, req.body);
  sendResponse(res, new ApiResponse(200, journal, 'Journal updated'));
});

export const deleteJournal = asyncHandler(async (req, res) => {
  await journalService.deleteJournal(req.params.id);
  sendResponse(res, new ApiResponse(200, null, 'Journal deleted'));
});

export default {
  listJournals,
  getJournal,
  createJournal,
  updateJournal,
  deleteJournal,
};
