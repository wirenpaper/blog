export interface ExpressError extends Error {
  statusCode: number
}

export function isExpressError(error: Error): error is ExpressError {
  return "statusCode" in error && typeof error.statusCode === "number"
}

export function createExpressError(statusCode: number, message: string) {
  const error = new Error(message) as Error & { statusCode: number }
  error.statusCode = statusCode
  return error
}

export function postgresStatusCode(code: string): number {
  switch (code) {
    // Postgres constraint violations
    case "23505": // unique_violation
      return 400
    case "23503": // foreign_key_violation
      return 400
    case "23502": // not_null_violation
      return 400
    case "23514": // check_violation
      return 400

    // Connection/timeout errors
    case "57014": // query_canceled
    case "57P01": // admin_shutdown
    case "57P02": // crash_shutdown
    case "57P03": // cannot_connect_now
      return 503

    // Permission errors
    case "42501": // insufficient_privilege
      return 403

    // Invalid input
    case "22001": // string_data_right_truncation
      return 400
    case "22003": // numeric_value_out_of_range
      return 400
    case "22007": // invalid_datetime_format
    case "22008": // datetime_field_overflow
      return 400

    // Syntax/query errors
    case "42601": // syntax_error
    case "42703": // undefined_column
    case "42P01": // undefined_table
      return 400

    default:
      return 500
  }
}

/*
 * export function createExpressError(message: string, statusCode: number): Error {
 *   const error = new Error(message);
 *   error.name = 'ExpressError';
 *   Object.defineProperty(error, 'statusCode', {
 *     value: statusCode,
 *     enumerable: true,
 *     writable: false,
 *   });
 *   return error;
 * }
 */
export class PostgressDBError extends Error {
  public statusCode: number
  public code?: string
  public detail?: string
  public func: string

  constructor(error: unknown, func: Function) {
    super("PostgressDBError");
    this.name = this.constructor.name;
    this.statusCode = 500;
    this.func = func.name

    const e = error as { code?: string; detail?: string; message?: string };
    this.code = e.code;
    this.detail = e.detail;

    switch (e.code) {
      // Postgres constraint violations
      case "23505": // unique_violation
        this.message = "A record with this value already exists";
        this.statusCode = 400;
        break;
      case "23503": // foreign_key_violation
        this.message = "Referenced record does not exist";
        this.statusCode = 400;
        break;
      case "23502": // not_null_violation
        this.message = "Required field is missing";
        this.statusCode = 400;
        break;
      case "23514": // check_violation
        this.message = "Data validation failed";
        this.statusCode = 400;
        break;

      // Connection/timeout errors
      case "57014": // query_canceled
      case "57P01": // admin_shutdown
      case "57P02": // crash_shutdown
      case "57P03": // cannot_connect_now
        this.message = "Database is temporarily unavailable";
        this.statusCode = 503;
        break;

      // Permission errors
      case "42501": // insufficient_privilege
        this.message = "Permission denied";
        this.statusCode = 403;
        break;

      // Invalid input
      case "22001": // string_data_right_truncation
        this.message = "Input value too long";
        this.statusCode = 400;
        break;
      case "22003": // numeric_value_out_of_range
        this.message = "Number out of valid range";
        this.statusCode = 400;
        break;
      case "22007": // invalid_datetime_format
      case "22008": // datetime_field_overflow
        this.message = "Invalid date/time format";
        this.statusCode = 400;
        break;

      // Syntax/query errors
      case "42601": // syntax_error
      case "42703": // undefined_column
      case "42P01": // undefined_table
        this.message = "Invalid query structure";
        this.statusCode = 400;
        break;

      default:
        this.message = e.message ?? "Unknown error occurred";
        // Keep 500 for unknown errors
        break;
    }
  }
}

export class UserError extends Error {
  public statusCode: number
  public func: string
  public message: string

  constructor(statusCode: number, func: Function, message: string) {
    super("User Error")

    this.name = "UserError"
    this.func = func.name
    this.statusCode = statusCode
    this.message = message

  }
}

export class PostError extends Error {
  public statusCode: number
  public func: string
  public message: string

  constructor(statusCode: number, func: Function, message: string) {
    super("Post Error")

    this.name = "PostError"
    this.func = func.name
    this.statusCode = statusCode
    this.message = message
  }
}

export class CommentError extends Error {
  public statusCode: number
  public func: string
  public message: string

  constructor(statusCode: number, func: Function, message: string) {
    super("Post Error")

    this.name = "CommentError"
    this.func = func.name
    this.statusCode = statusCode
    this.message = message
  }
}

export class JWTError extends Error {
  public statusCode: number;
  public func: string

  constructor(rawError: unknown, func: Function) {
    super("JWT Error");

    this.name = "JWTError";
    this.statusCode = 401;  // a common default for JWT issues
    this.func = func.name

    const e = rawError as { name?: string; message?: string };

    switch (e.name) {
      case "TokenExpiredError":
        this.message = "JWT token has expired";
        break;

      case "JsonWebTokenError":
        this.message = "Invalid JWT token";
        break;

      case "NotBeforeError":
        this.message = "JWT token not active yet";
        break;

      default:
        // Fallback to the original message if available
        this.message = e.message ?? "Unknown JWT error";
        break;
    }
  }
}
