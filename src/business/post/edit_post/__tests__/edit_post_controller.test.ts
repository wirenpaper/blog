import express from "express"
import supertest from "supertest"
// import { makePostRouter, PostService } from "@business/post/create_post/create_post_controller.js"
import { makeEditPostRouter } from "@business/post/edit_post/edit_post_controller.js"
// import { makePostService } from "@business/post/create_post/create_post_service.js"
import { makeEditPostService } from "@business/post/edit_post/edit_post_service.js"
import { mockPostRepo } from "@db/post/__mocks__/post_repository.mock.js"
import { userIdExists } from "@business/post/edit_post/edit_post_controller_aux.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/post/edit_post/edit_post_service.js", () => ({
  makeEditPostService: jest.fn()
}))

jest.mock("@business/post/edit_post/edit_post_controller_aux.js", () => ({
  userIdExists: jest.fn()
}))

describe("makePostRouter", () => {
  describe("PUT/:id", () => {
    let app: express.Express
    const mockEditPost = {
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
      (userIdExists as jest.Mock).mockReturnValue(3)
      mockEditPost.editPost.mockResolvedValue(undefined)

      const response = await (supertest(app)
        .put("/3") as supertest.Test)
        .send({ mPost: "harhar" })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: "Post edited" })
    })

    it("fail; userId doesnt exist", async () => {
      const expressError = createExpressError(500, "req.userId does not exist");
      (userIdExists as jest.Mock).mockImplementation(() => {
        throw expressError // Executes this code and throws synchronously
      })
      // (userIdExists as jest.Mock).mockRejectedValue(expressError) <-- FOR ASYNC
      mockEditPost.editPost.mockResolvedValue(undefined)

      const response = await (supertest(app)
        .put("/3") as supertest.Test)
        .send({ mPost: "harhar" })

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ message: "req.userId does not exist" })
    })

    it("Should handle ExpressError with correct status code", async () => {
      (userIdExists as jest.Mock).mockReturnValue(3)
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
      (userIdExists as jest.Mock).mockReturnValue(3)
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
