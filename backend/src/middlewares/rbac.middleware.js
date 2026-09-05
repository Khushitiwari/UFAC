import { ApiError } from '../utils/ApiError.js';

/**
 * Role-based access control guard.
 * @param {...string} allowedRoles
 */
export const requireRole = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'Insufficient permissions'));
  }

  next();
};

export default requireRole;
