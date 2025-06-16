import express from "express"
import supertest from "supertest"
import { makeDeleteCommentRouter } from
  "@business/comment/delete-comment/deleteCommentController.js"
import { makeDeleteCommentService, MakeDeleteCommentService }
  from "@business/comment/delete-comment/deleteCommentService.js"
import { mockCommentRepo } from "@db/comment/__mocks__/commentRepository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/comment/delete-comment/deleteCommentService.js", () => ({
  makeDeleteCommentService: jest.fn()
}))

describe("makeDeleteCommentRouter", () => {
  describe("DELETE /:id", () => {
    let app: express.Express
    const mockDeleteComment: jest.Mocked<MakeDeleteCommentService> = {
      deleteComment: jest.fn()
    }

    beforeAll(() => {
      (makeDeleteCommentService as jest.Mock).mockReturnValue(mockDeleteComment)
      const router = makeDeleteCommentRouter(mockCommentRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      mockDeleteComment.deleteComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .delete("/3")

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        message: "Comment deleted"
      })
    })

    it("Failure; id is not number", async () => {
      mockDeleteComment.deleteComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .delete("/lol")

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "ID must be a numeric value., ID must be a positive integer."
      })
    })

    it("Failure; id is float", async () => {
      mockDeleteComment.deleteComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .delete("/1.1")

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "ID must be a positive integer."
      })
    })

    it("Failure; id is negative", async () => {
      mockDeleteComment.deleteComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .delete("/-1")

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "ID must be a positive integer."
      })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockDeleteComment.deleteComment.mockRejectedValue(expressError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .delete("/3")

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockDeleteComment.deleteComment.mockRejectedValue(generalError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .delete("/3")

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
