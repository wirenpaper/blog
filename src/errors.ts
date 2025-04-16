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
