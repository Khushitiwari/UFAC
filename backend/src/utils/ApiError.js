export class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {unknown} [details]
   */
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}
