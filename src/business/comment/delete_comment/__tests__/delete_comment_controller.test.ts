import express from "express"
import supertest from "supertest"
import { makeDeleteCommentRouter } from
  "@business/comment/delete_comment/delete_comment_controller.js"
import { makeDeleteCommentService, MakeDeleteCommentService }
  from "@business/comment/delete_comment/delete_comment_service.js"
import { mockCommentRepo } from "@db/comment/__mocks__/comment_repository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/comment/delete_comment/delete_comment_service.js", () => ({
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

      const response = await (supertest(app)
        .delete("/3") as supertest.Test)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        message: "Comment deleted"
      })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockDeleteComment.deleteComment.mockRejectedValue(expressError)

      const response = await (supertest(app)
        .delete("/3") as supertest.Test)

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockDeleteComment.deleteComment.mockRejectedValue(generalError)

      const response = await (supertest(app)
        .delete("/3") as supertest.Test)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
