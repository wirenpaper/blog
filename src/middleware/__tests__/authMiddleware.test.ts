import authMiddleware from "@middleware/authMiddleware.js"
import jwt, { JwtPayload, VerifyCallback } from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import { ExpressError } from "@src/errors.js"


jest.mock("jsonwebtoken")

describe("authMiddleware", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    (jwt.sign as jest.Mock).mockReset()
    process.env.JWT_SECRET = "process.env.JWT_SECRET.token"
  })

  it("Success", () => {
    // Arrange
    process.env.JWT_SECRET = "test-secret";
    (jwt.sign as jest.Mock).mockReturnValue("test.jwt.token")

    const req = {
      headers: {
        authorization: "valid-token"
      }
    } as Request

    const res = {} as Response

    const next = jest.fn() as NextFunction

    // Mock jwt.verify to simulate successful verification
    (jwt.verify as jest.Mock).mockImplementation((_token: string, _secret: string, callback: VerifyCallback) => {
      callback(null, { id: 123 } as JwtPayload)  // null error, valid decoded payload
    })

    // Act
    authMiddleware(req, res, next)

    // Assert
    expect(req.userId).toBe(123)
    expect(next).toHaveBeenCalled()
  })

  it("Valid error arg", () => {
    // Arrange
    process.env.JWT_SECRET = "test-secret";
    (jwt.sign as jest.Mock).mockReturnValue("test.jwt.token")

    const req = {
      headers: {
        authorization: "valid-token"
      }
    } as Request

    const res = {} as Response

    const next = jest.fn() as NextFunction

    const error = {
      name: "TokenExpiredError",
      message: "jwt expired",
      expiredAt: new Date()
    } as jwt.TokenExpiredError

    // Mock jwt.verify to simulate successful verification
    (jwt.verify as jest.Mock).mockImplementation((_token: string, _secret: string, callback: VerifyCallback) => {
      callback(error, { id: 123 } as JwtPayload)  // null error, valid decoded payload
    })

    // Act & Assert

    expect(() => {
      authMiddleware(req, res, next);
    }).toThrow(
      expect.objectContaining({
        statusCode: 401,
        message: "Invalid token"
      }) as ExpressError
    );

  })

  it("!decoded", () => {
    // Arrange
    process.env.JWT_SECRET = "test-secret";
    (jwt.sign as jest.Mock).mockReturnValue("test.jwt.token")

    const req = {
      headers: {
        authorization: "valid-token"
      }
    } as Request

    const res = {} as Response

    const next = jest.fn() as NextFunction

    // Mock jwt.verify to simulate successful verification
    (jwt.verify as jest.Mock).mockImplementation((_token: string, _secret: string, callback: VerifyCallback) => {
      callback(null, undefined)  // null error, valid decoded payload
    })

    expect(() => {
      authMiddleware(req, res, next);
    }).toThrow(
      expect.objectContaining({
        statusCode: 500,
        message: "Decoded is undefined"
      }) as ExpressError
    );

  })

  it("Decoded is a string", () => {
    // Arrange
    process.env.JWT_SECRET = "test-secret";
    (jwt.sign as jest.Mock).mockReturnValue("test.jwt.token")

    const req = {
      headers: {
        authorization: "valid-token"
      }
    } as Request

    const res = {} as Response

    const next = jest.fn() as NextFunction

    // Mock jwt.verify to simulate successful verification
    (jwt.verify as jest.Mock).mockImplementation((_token: string, _secret: string, callback: VerifyCallback) => {
      callback(null, "oops")  // null error, valid decoded payload
    })

    expect(() => {
      authMiddleware(req, res, next);
    }).toThrow(
      expect.objectContaining({
        statusCode: 500,
        message: "Decoded not of type JwtPayload"
      }) as ExpressError
    );

  })

  it("Decoded id is not a number", () => {
    // Arrange
    process.env.JWT_SECRET = "test-secret";
    (jwt.sign as jest.Mock).mockReturnValue("test.jwt.token")

    const req = {
      headers: {
        authorization: "valid-token"
      }
    } as Request

    const res = {} as Response

    const next = jest.fn() as NextFunction

    // Mock jwt.verify to simulate successful verification
    (jwt.verify as jest.Mock).mockImplementation((_token: string, _secret: string, callback: VerifyCallback) => {
      callback(null, { id: "oops" })
    })

    expect(() => {
      authMiddleware(req, res, next);
    }).toThrow(
      expect.objectContaining({
        statusCode: 500,
        message: "decoded.id not yielding number, error"
      }) as ExpressError
    );

  })

  it("!token", () => {
    // Arrange
    (jwt.sign as jest.Mock).mockReturnValue("test.jwt.token")

    const req = {
      headers: {
        authorization: undefined
      }
    } as Request

    /*const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response
    */

    const next = jest.fn() as NextFunction

    // Mock jwt.verify to simulate successful verification
    (jwt.verify as jest.Mock).mockImplementation((_token: string, _secret: string, callback: VerifyCallback) => {
      callback(null, { id: 123 } as JwtPayload)  // null error, valid decoded payload
    })
    const res = {} as Response

    // Act & Assert
    expect(() => authMiddleware(req, res, next)).toThrow(
      expect.objectContaining({
        statusCode: 401,
        message: "No token provided"
      }) as ExpressError
    )
  })

  it("!secret", () => {
    // Arrange
    (jwt.sign as jest.Mock).mockReturnValue("test.jwt.token")
    delete process.env.JWT_SECRET


    const req = {
      headers: {
        authorization: "valid-token"
      }
    } as Request

    /*const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response*/

    const next = jest.fn() as NextFunction

    // Mock jwt.verify to simulate successful verification
    (jwt.verify as jest.Mock).mockImplementation((_token: string, _secret: string, callback: VerifyCallback) => {
      callback(null, { id: 123 } as JwtPayload)  // null error, valid decoded payload
    })
    const res = {} as Response

    // Act & Assert
    expect(() => authMiddleware(req, res, next)).toThrow(
      expect.objectContaining({
        statusCode: 500,
        message: "Server misconfiguration: missing JWT_SECRET"
      }) as ExpressError
    )
  })

})
