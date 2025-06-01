import express from "express"
import supertest from "supertest"
import { makeLoginRouter, MakeLoginRequest } from "@business/auth/login/login_controller.js"
import { MakeLoginService, makeLoginService } from "@business/auth/login/login_service.js"
import { mockUserRepo } from "@db/user/__mocks__/user_repository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/auth/login/login_service.js", () => ({
  makeLoginService: jest.fn()
}))

describe("makeLoginRouter", () => {
  describe("POST /", () => {
    let app: express.Express
    const mockLoginUser: jest.Mocked<MakeLoginService> = {
      loginUser: jest.fn()
    }

    beforeAll(() => {
      (makeLoginService as jest.Mock).mockReturnValue(mockLoginUser)
      const router = makeLoginRouter(mockUserRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; should return a token when login is successful", async () => {
      mockLoginUser.loginUser.mockResolvedValue({
        token: "mock-token-123",
        userWithoutPassword: {
          id: 32,
          userName: "jimbob",
        }
      })

      const requestData: MakeLoginRequest = {
        userName: "testUser",
        password: "password123",
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        token: "mock-token-123",
        userWithoutPassword: { id: 32, userName: "jimbob" }
      })
    })

    it("Failure; userName is empty", async () => {
      mockLoginUser.loginUser.mockResolvedValue({
        token: "mock-token-123",
        userWithoutPassword: {
          id: 32,
          userName: "jimbob",
        }
      })

      const requestData: MakeLoginRequest = {
        userName: "",
        password: "password123",
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "User name cannot be empty."
      })
    })

    it("Failure; password is empty", async () => {
      mockLoginUser.loginUser.mockResolvedValue({
        token: "mock-token-123",
        userWithoutPassword: {
          id: 32,
          userName: "jimbob",
        }
      })

      const requestData: MakeLoginRequest = {
        userName: "testUser",
        password: "",
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "Password cannot be empty."
      })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockLoginUser.loginUser.mockRejectedValue(expressError)

      const requestData: MakeLoginRequest = {
        userName: "testUser",
        password: "weak",
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
      mockLoginUser.loginUser.mockRejectedValue(generalError)

      const requestData: MakeLoginRequest = {
        userName: "testUser",
        password: "password123",
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
