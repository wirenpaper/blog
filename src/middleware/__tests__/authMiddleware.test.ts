import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import authMiddleware from "@middleware/authMiddleware.js"
// We don't need ExpressError for these tests, as we can check object properties directly.

// --- CHANGE 1: Mock the entire library correctly for type safety ---
// This tells TypeScript what the mocked version looks like.
jest.mock("jsonwebtoken")
const mockedJwt = jwt as jest.Mocked<typeof jwt>

describe("authMiddleware", () => {
  // Define reusable test objects
  let req: Partial<Request>
  let res: Partial<Response> // We don't use res, but it's good practice
  let next: NextFunction

  // --- CHANGE 2: Use beforeEach for clean state in every test ---
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Set up default environment
    process.env.JWT_SECRET = "test-secret"

    // Create fresh mock objects for each test
    req = {
      headers: {},
    }
    res = {}
    next = jest.fn()
  })

  // --- Test the "Happy Path" ---
  it("should attach userId to req and call next() on success", async () => {
    // Arrange
    req.headers = { authorization: "Bearer valid.token.here" }
    const mockPayload = { id: 123, username: "test" };

    // --- CHANGE 3: The new, simpler way to mock `jwt.verify` ---
    // For success, just have it return the desired value. No callbacks needed.
    (mockedJwt.verify as jest.Mock).mockReturnValue(mockPayload)

    // Act
    // --- CHANGE 4: Await the async middleware function ---
    await authMiddleware(req as Request, res as Response, next)

    // Assert
    expect(mockedJwt.verify).toHaveBeenCalledWith("valid.token.here", "test-secret")
    expect(req.userId).toBe(123)
    // Ensure next() was called with NO arguments, indicating success
    expect(next).toHaveBeenCalledWith()
  })

  // --- Grouping header/token format tests ---
  describe("Header and Token Format Errors", () => {
    it("should call next with a 401 error if no Authorization header is provided", async () => {
      // Arrange
      req.headers = {} // No authorization header

      // Act
      await authMiddleware(req as Request, res as Response, next)

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "No token provided or malformed header",
        })
      )
    })

    it("should call next with a 401 error if header is not in Bearer format", async () => {
      // Arrange
      req.headers = { authorization: "invalid.token.format" }

      // Act
      await authMiddleware(req as Request, res as Response, next)

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "No token provided or malformed header",
        })
      )
    })
  })

  // --- Test for when the token itself is bad (signature, expired) ---
  it("should call next with a 401 error if jwt.verify throws an error", async () => {
    // Arrange
    req.headers = { authorization: "Bearer expired.or.invalid.token" }

    // --- CHANGE 5: Mocking a failure is now just throwing an error ---
    const jwtError = new jwt.JsonWebTokenError("jwt expired")
    mockedJwt.verify.mockImplementation(() => {
      throw jwtError
    })

    // Act
    await authMiddleware(req as Request, res as Response, next)

    // Assert
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: "Invalid or expired token",
      })
    )
  })

  // --- Test for when the payload content is wrong ---
  it("should call next with a 401 error if the decoded payload is invalid", async () => {
    // Arrange
    req.headers = { authorization: "Bearer valid.token.with.bad.payload" }
    // Payload is missing 'id' or it's the wrong type
    const mockInvalidPayload = { user: "test" }; // No 'id' property
    (mockedJwt.verify as jest.Mock).mockReturnValue(mockInvalidPayload)

    // Act
    await authMiddleware(req as Request, res as Response, next)

    // Assert
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: "Invalid token payload",
      })
    )
  })

  // --- Test for server configuration issues ---
  it("should call next with a 500 error if JWT_SECRET is not configured", async () => {
    // Arrange
    req.headers = { authorization: "Bearer any.token" }
    delete process.env.JWT_SECRET // Simulate missing environment variable

    // Act
    await authMiddleware(req as Request, res as Response, next)

    // Assert
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: "Server misconfiguration: missing JWT_SECRET",
      })
    )
  })
})
