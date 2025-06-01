import express from "express"
import supertest from "supertest"
import { makeDeleteUserRouter } from "@business/auth/delete_user/delete_user_controller.js"
import { makeDeleteUserService, DeleteUserService } from "@business/auth/delete_user/delete_user_service.js"
import { mockUserRepo } from "@db/user/__mocks__/user_repository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/auth/delete_user/delete_user_service.js", () => ({
  makeDeleteUserService: jest.fn()
}))

describe("makeDeleteUserRouter", () => {
  describe("DELETE/:id", () => {
    let app: express.Express
    const mockDeleteUser: jest.Mocked<DeleteUserService> = {
      deleteUser: jest.fn()
    }

    beforeAll(() => {
      (makeDeleteUserService as jest.Mock).mockReturnValue(mockDeleteUser)
      const router = makeDeleteUserRouter(mockUserRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      mockDeleteUser.deleteUser.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .delete("/")

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: "User deleted" })
    })

    it("Should handle ExpressError with correct status code", async () => {
      // (userIdExists as jest.Mock<number>).mockReturnValue(3)
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockDeleteUser.deleteUser.mockRejectedValue(expressError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .delete("/")

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockDeleteUser.deleteUser.mockRejectedValue(generalError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .delete("/")

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
