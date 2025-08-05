// ./utils/ExpressError.js
class ExpressError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status; // status should be a number like 404, 500, etc.
  }
}

module.exports = ExpressError;
