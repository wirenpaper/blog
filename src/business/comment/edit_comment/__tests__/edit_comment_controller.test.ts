import express from "express"
import supertest from "supertest"
import { makeEditCommentRouter } from "@business/comment/edit_comment/edit_comment_controller.js"
import { makeEditCommentService, MakeEditCommentService } from
  "@business/comment/edit_comment/edit_comment_service.js"
import { mockCommentRepo } from "@db/comment/__mocks__/comment_repository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/comment/edit_comment/edit_comment_service.js", () => ({
  makeEditCommentService: jest.fn()
}))

describe("makeEditCommentRouter", () => {
  describe("PUT /:id", () => {
    let app: express.Express
    const mockEditComment: jest.Mocked<MakeEditCommentService> = {
      editComment: jest.fn()
    }

    beforeAll(() => {
      (makeEditCommentService as jest.Mock).mockReturnValue(mockEditComment)
      const router = makeEditCommentRouter(mockCommentRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      mockEditComment.editComment.mockResolvedValue()

      const response = await (supertest(app)
        .put("/3") as supertest.Test)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        message: "Comment updated"
      })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockEditComment.editComment.mockRejectedValue(expressError)

      const response = await (supertest(app)
        .put("/3") as supertest.Test)

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockEditComment.editComment.mockRejectedValue(generalError)

      const response = await (supertest(app)
        .put("/3") as supertest.Test)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
