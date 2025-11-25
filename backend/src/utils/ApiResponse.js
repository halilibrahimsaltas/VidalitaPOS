export class ApiResponse {
  constructor(success, data = null, message = null, statusCode = 200) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      data,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message = 'Error', statusCode = 500) {
    return {
      success: false,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }
}

