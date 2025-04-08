import express from "express"
import supertest from "supertest"
import { makeDeletePostRouter } from "@business/post/delete_post/delete_post_controller.js"
import { makeDeletePostService } from "@business/post/delete_post/delete_post_service.js"
import { mockPostRepo } from "@db/post/__mocks__/post_repository.mock.js"
import { userIdExists } from "@business/post/delete_post/delete_post_controller_aux.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/post/delete_post/delete_post_service.js", () => ({
  makeDeletePostService: jest.fn()
}))

jest.mock("@business/post/delete_post/delete_post_controller_aux.js", () => ({
  userIdExists: jest.fn()
}))

describe("makeDeletePostRouter", () => {
  describe("DELETE/:id", () => {
    let app: express.Express
    const mockDeletePost = {
      deletePost: jest.fn()
    }

    beforeAll(() => {
      (makeDeletePostService as jest.Mock).mockReturnValue(mockDeletePost)
      const router = makeDeletePostRouter(mockPostRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; should return a token when login is successful", async () => {
      (userIdExists as jest.Mock).mockReturnValue(3)
      mockDeletePost.deletePost.mockResolvedValue({
        id: 32,
      })

      const response = await (supertest(app)
        .delete("/32") as supertest.Test)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: "Post deleted" })
    })

    it("fail; userId doesnt exist", async () => {
      const expressError = createExpressError(500, "req.userId does not exist");
      (userIdExists as jest.Mock).mockImplementation(() => {
        throw expressError // Executes this code and throws synchronously
      })
      // (userIdExists as jest.Mock).mockRejectedValue(expressError) <-- FOR ASYNC
      mockDeletePost.deletePost.mockResolvedValue({
        id: 32,
      })

      const response = await (supertest(app)
        .delete("/32") as supertest.Test)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ message: "req.userId does not exist" })
    })

    it("Should handle ExpressError with correct status code", async () => {
      (userIdExists as jest.Mock).mockReturnValue(3)
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockDeletePost.deletePost.mockRejectedValue(expressError)

      const response = await (supertest(app)
        .delete("/32") as supertest.Test)

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      (userIdExists as jest.Mock).mockReturnValue(3)
      const generalError = new Error("Database connection failed")
      mockDeletePost.deletePost.mockRejectedValue(generalError)

      const response = await (supertest(app)
        .delete("/32") as supertest.Test)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
