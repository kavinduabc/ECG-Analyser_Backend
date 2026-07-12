/**
 * Send a successful JSON response.
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message - Human-readable message
 * @param {object} data - Additional payload fields
 */
function sendSuccess(res, statusCode = 200, message = "Success", data = {}) {
    return res.status(statusCode).json({
        success: true,
        message,
        ...data,
    });
}

/**
 * Send an error JSON response.
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} message - Human-readable error message
 * @param {string|null} error - Raw error detail (omit in production if needed)
 */
function sendError(res, statusCode = 500, message = "An error occurred", error = null) {
    const body = { success: false, message };
    if (error) body.error = error;
    return res.status(statusCode).json(body);
}

module.exports = { sendSuccess, sendError };
