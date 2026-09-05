export class ApiResponse {
  /**
   * @param {number} statusCode
   * @param {unknown} data
   * @param {string} [message]
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }
}

export const sendResponse = (res, apiResponse) => {
  return res.status(apiResponse.statusCode).json({
    success: true,
    message: apiResponse.message,
    data: apiResponse.data,
  });
};
