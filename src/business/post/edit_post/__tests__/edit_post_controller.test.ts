import express from "express"
import supertest from "supertest"
import { makeEditPostRouter } from "@business/post/edit_post/edit_post_controller.js"
import { makeEditPostService, MakeEditPostService } from "@business/post/edit_post/edit_post_service.js"
import { mockPostRepo } from "@db/post/__mocks__/post_repository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/post/edit_post/edit_post_service.js", () => ({
  makeEditPostService: jest.fn()
}))

describe("makeEditPostRouter", () => {
  describe("PUT/:id", () => {
    let app: express.Express
    const mockEditPost: jest.Mocked<MakeEditPostService> = {
      editPost: jest.fn()
    }

    beforeAll(() => {
      (makeEditPostService as jest.Mock).mockReturnValue(mockEditPost)
      const router = makeEditPostRouter(mockPostRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; should edit if successful", async () => {
      mockEditPost.editPost.mockResolvedValue()

      const response = await (supertest(app)
        .put("/3") as supertest.Test)
        .send({ mPost: "harhar" })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: "Post edited" })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockEditPost.editPost.mockRejectedValue(expressError)

      const response = await (supertest(app)
        .put("/3") as supertest.Test)
        .send({ mPost: "harhar" })

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockEditPost.editPost.mockRejectedValue(generalError)

      const response = await (supertest(app)
        .put("/3") as supertest.Test)
        .send({ mPost: "harhar" })

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
