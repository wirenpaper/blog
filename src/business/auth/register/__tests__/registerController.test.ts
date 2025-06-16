import express from "express"
import supertest from "supertest"
import { makeRegisterRouter, RegisterRequest } from "@business/auth/register/registerController.js"
import { MakeRegisterService, makeRegisterService } from "@business/auth/register/registerService.js"
import { mockUserRepo } from "@db/user/__mocks__/user_repository.mock.js"
import { createExpressError } from "@src/errors.js"

// Mock the register service module
jest.mock("@business/auth/register/registerService.js", () => ({
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
        userName: "testUser@gmail.com",
        password: "K!m1@2025#P@ssw0rd$",
        firstName: "John",
        lastName: "Doe"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ token: "mock-token-123" })
    })

    it("Failure; UserName cannot be empty", async () => {
      mockRegisterUser.registerUser.mockResolvedValue({
        token: "mock-token-123",
        user: { userName: "testUser" }
      })

      const requestData: RegisterRequest = {
        userName: "",
        password: "K!m1@2025#P@ssw0rd$",
        firstName: "John",
        lastName: "Doe"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ message: "UserName is required., UserName must be a valid email address." })
    })

    it("Failure; UserName cannot be empty", async () => {
      mockRegisterUser.registerUser.mockResolvedValue({
        token: "mock-token-123",
        user: { userName: "testUser" }
      })

      const requestData: RegisterRequest = {
        userName: "boom.doom",
        password: "K!m1@2025#P@ssw0rd$",
        firstName: "John",
        lastName: "Doe"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ message: "UserName must be a valid email address." })
    })

    it("Failure; password too short", async () => {
      mockRegisterUser.registerUser.mockResolvedValue({
        token: "mock-token-123",
        user: { userName: "testUser" }
      })

      const requestData: RegisterRequest = {
        userName: "testUser@gmail.com",
        password: "1234567",
        firstName: "John",
        lastName: "Doe"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "New password must be between 8 and 128 characters., New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character."
      })
    })

    it("Failure; password too long", async () => {
      mockRegisterUser.registerUser.mockResolvedValue({
        token: "mock-token-123",
        user: { userName: "testUser" }
      })

      const requestData: RegisterRequest = {
        userName: "testUser@gmail.com",
        password: "A".repeat(129) + "a1@",
        firstName: "John",
        lastName: "Doe"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ message: "New password must be between 8 and 128 characters." })
    })

    it("Failure; password too simple", async () => {
      mockRegisterUser.registerUser.mockResolvedValue({
        token: "mock-token-123",
        user: { userName: "testUser" }
      })

      const requestData: RegisterRequest = {
        userName: "testUser@gmail.com",
        password: "Password123",
        firstName: "John",
        lastName: "Doe"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character."
      })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockRegisterUser.registerUser.mockRejectedValue(expressError)

      const requestData: RegisterRequest = {
        userName: "testUser@gmail.com",
        password: "K!m1@2025#P@ssw0rd$",
        firstName: "John",
        lastName: "Doe"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)


      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockRegisterUser.registerUser.mockRejectedValue(generalError)

      const requestData: RegisterRequest = {
        userName: "testUser@gmail.com",
        password: "K!m1@2025#P@ssw0rd$",
        firstName: "John",
        lastName: "Doe"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })
  })
})
