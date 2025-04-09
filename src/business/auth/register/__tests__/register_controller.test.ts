import express from "express"
import supertest from "supertest"
import { makeRegisterRouter, RegisterRequest } from "@business/auth/register/register_controller.js"
import { MakeRegisterService, makeRegisterService } from "@business/auth/register/register_service.js"
import { mockUserRepo } from "@db/user/__mocks__/user_repository.mock.js"
import { createExpressError } from "@src/errors.js"

// Mock the register service module
jest.mock("@business/auth/register/register_service.js", () => ({
  makeRegisterService: jest.fn()
}))

describe("makeRegisterRouter", () => {
  describe("POST /", () => {
    let app: express.Express
    const mockRegisterUser: jest.Mocked<MakeRegisterService> = {
      registerUser: jest.fn()
    }

    beforeAll(() => {
      (makeRegisterService as jest.Mock).mockReturnValue(mockRegisterUser)
      const router = makeRegisterRouter(mockUserRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; should return a token when registration is successful", async () => {
      mockRegisterUser.registerUser.mockResolvedValue({
        token: "mock-token-123",
        user: { userName: "testUser" }
      })

      const requestData: RegisterRequest = {
        userName: "testUser",
        password: "password123",
        firstName: "John",
        lastName: "Doe"
      }

      const response = await (supertest(app)
        .post("/") as supertest.Test)
        .send(requestData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ token: "mock-token-123" })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockRegisterUser.registerUser.mockRejectedValue(expressError)

      const requestData: RegisterRequest = {
        userName: "testUser",
        password: "weak",
        firstName: "John",
        lastName: "Doe"
      }

      const response = await (supertest(app)
        .post("/") as supertest.Test)
        .send(requestData)


      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockRegisterUser.registerUser.mockRejectedValue(generalError)

      const requestData: RegisterRequest = {
        userName: "testUser",
        password: "password123",
        firstName: "John",
        lastName: "Doe"
      }

      const response = await (supertest(app)
        .post("/") as supertest.Test)
        .send(requestData)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })
  })
})
