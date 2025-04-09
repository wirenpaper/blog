import express from "express"
import supertest from "supertest"
import { makePostRouter, PostService } from "@business/post/create_post/create_post_controller.js"
import { MakePostService, makePostService, PostParams, PostResult } from "@business/post/create_post/create_post_service.js"
import { mockPostRepo } from "@db/post/__mocks__/post_repository.mock.js"
import { userIdExists } from "@business/post/create_post/create_post_controller_aux.js"
import { createExpressError } from "@src/errors.js"


jest.mock("@business/post/create_post/create_post_service.js", () => ({
  makePostService: jest.fn()
}))

jest.mock("@business/post/create_post/create_post_controller_aux.js", () => ({
  userIdExists: jest.fn()
}))

describe("makePostRouter", () => {
  describe("POST /", () => {
    let app: express.Express
    const mockCreatePost: jest.Mocked<MakePostService> = {
      createPost: jest.fn<Promise<PostResult>, [PostParams]>()
    }

    beforeAll(() => {
      (makePostService as jest.Mock).mockReturnValue(mockCreatePost)
      const router = makePostRouter(mockPostRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; should return a token when login is successful", async () => {
      (userIdExists as jest.Mock).mockReturnValue(3)
      mockCreatePost.createPost.mockResolvedValue({
        id: 32,
        mPost: "ha",
        userId: 1,
      })


      const requestData: PostService = {
        mPost: "harharpost"
      }

      const response = await (supertest(app)
        .post("/") as supertest.Test)
        .send(requestData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        id: 32,
        mPost: "ha",
        userId: 1,
      })
    })

    it("fail; userId doesnt exist", async () => {
      const expressError = createExpressError(500, "req.userId does not exist");
      (userIdExists as jest.Mock).mockImplementation(() => {
        throw expressError // Executes this code and throws synchronously
      })
      // (userIdExists as jest.Mock).mockRejectedValue(expressError) <-- FOR ASYNC
      mockCreatePost.createPost.mockResolvedValue({
        id: 32,
        mPost: "ha",
        userId: 1,
      })


      const requestData: PostService = {
        mPost: "harharpost"
      }


      const response = await (supertest(app)
        .post("/") as supertest.Test)
        .send(requestData)


      expect(response.status).toBe(500)
      expect(response.body).toEqual({ message: "req.userId does not exist" })
    })


    it("Should handle ExpressError with correct status code", async () => {
      (userIdExists as jest.Mock).mockReturnValue(3)
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockCreatePost.createPost.mockRejectedValue(expressError)

      const requestData: PostService = {
        mPost: "harharpost"
      }

      const response = await (supertest(app)
        .post("/") as supertest.Test)
        .send(requestData)

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      (userIdExists as jest.Mock).mockReturnValue(3)
      const generalError = new Error("Database connection failed")
      mockCreatePost.createPost.mockRejectedValue(generalError)

      const requestData: PostService = {
        mPost: "harharpost"
      }

      const response = await (supertest(app)
        .post("/") as supertest.Test)
        .send(requestData)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
