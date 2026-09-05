import { ApiError } from './ApiError.js';

/**
 * CONTACT-role users are scoped to their own contactId.
 */
export const contactScope = (user) => {
  if (user.role === 'CONTACT' && user.contactId) {
    return { contactId: user.contactId };
  }
  return {};
};

export const assertWriteAccess = (user) => {
  if (user.role === 'CONTACT') {
    throw new ApiError(403, 'Insufficient permissions');
  }
};
