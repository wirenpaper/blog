import express from "express"
import supertest from "supertest"
import { makeDeletePostRouter } from "@business/post/delete-post/deletePostController.js"
import { MakeDeletePostService, makeDeletePostService } from "@business/post/delete-post/deletePostService.js"
import { mockPostRepo } from "@db/post/__mocks__/postRepository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/post/delete-post/deletePostService.js", () => ({
  makeDeletePostService: jest.fn()
}))

describe("makeDeletePostRouter", () => {
  describe("DELETE/:id", () => {
    let app: express.Express
    const mockDeletePost: jest.Mocked<MakeDeletePostService> = {
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

    it("Success", async () => {
      mockDeletePost.deletePost.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .delete("/32")

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: "Post deleted" })
    })

    it("Should handle ExpressError with correct status code", async () => {
      // (userIdExists as jest.Mock<number>).mockReturnValue(3)
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockDeletePost.deletePost.mockRejectedValue(expressError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .delete("/32")

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Failure; id is not number", async () => {
      mockDeletePost.deletePost.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .delete("/lol")

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "ID must be a numeric value., ID must be a positive integer."
      })
    })

    it("Failure; id is float", async () => {
      mockDeletePost.deletePost.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .delete("/1.1")

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "ID must be a positive integer."
      })
    })

    it("Failure; id is negative", async () => {
      mockDeletePost.deletePost.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .delete("/-1")

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "ID must be a positive integer."
      })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockDeletePost.deletePost.mockRejectedValue(generalError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .delete("/32")

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
