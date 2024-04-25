export class JsonHttpExceptionError extends Error {
  constructor({ message, status }) {
    super(JSON.stringify(message));
    this.json = { errors: message };
    this.name = this.constructor.name;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
  statusCode() {
    return this.status;
  }
}
