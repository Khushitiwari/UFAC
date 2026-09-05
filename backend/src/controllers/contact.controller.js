import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import * as contactService from '../services/contact.service.js';

export const listContacts = asyncHandler(async (req, res) => {
  const result = await contactService.listContacts(req.query);
  sendResponse(res, new ApiResponse(200, result));
});

export const getContact = asyncHandler(async (req, res) => {
  const contact = await contactService.getContactById(req.params.id);
  sendResponse(res, new ApiResponse(200, contact));
});

export const createContact = asyncHandler(async (req, res) => {
  const contact = await contactService.createContact(req.body);
  sendResponse(res, new ApiResponse(201, contact, 'Contact created'));
});

export const updateContact = asyncHandler(async (req, res) => {
  const contact = await contactService.updateContact(req.params.id, req.body);
  sendResponse(res, new ApiResponse(200, contact, 'Contact updated'));
});

export const deleteContact = asyncHandler(async (req, res) => {
  await contactService.deleteContact(req.params.id);
  sendResponse(res, new ApiResponse(200, null, 'Contact deleted'));
});

export default {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
};
