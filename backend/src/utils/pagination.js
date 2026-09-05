/**
 * @param {import('express').Request} req
 * @param {{ defaultPage?: number, defaultLimit?: number, maxLimit?: number }} [options]
 */
export const getPagination = (req, options = {}) => {
  const { defaultPage = 1, defaultLimit = 20, maxLimit = 100 } = options;

  const page = Math.max(1, parseInt(req.query.page, 10) || defaultPage);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip, take: limit };
};

/**
 * @param {number} total
 * @param {number} page
 * @param {number} limit
 */
export const paginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit) || 1,
});
