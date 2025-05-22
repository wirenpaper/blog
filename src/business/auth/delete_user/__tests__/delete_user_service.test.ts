import { mockUserRepo } from "@db/user/__mocks__/user_repository.mock.js"
import { makeDeleteUserService } from "@business/auth/delete_user/delete_user_service.js"
import { verifyUser } from "@business/aux.js"

jest.mock("@src/db.js")

jest.mock("@business/aux.js", () => ({
  verifyUser: jest.fn()
}))

describe("makeDeletePostService", () => {
  describe("deletePost", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      mockUserRepo.deleteUserById.mockResolvedValue(undefined);
      (verifyUser as jest.Mock<undefined>).mockReturnValue(undefined)
      // Act
      const result = await makeDeleteUserService(mockUserRepo).deleteUser({
        id: 3,
        userId: 3
      })

      // Assert
      expect(result).toEqual(undefined)
    })

    /*
     *     it("!ownership", async () => {
     *       // Arrange
     *       mockPostRepo.checkPostOwnership.mockResolvedValue(undefined)
     *       mockPostRepo.deletePostById.mockResolvedValue(undefined)
     * 
     *       // Act & Assert
     *       await expect(makeDeletePostService(mockPostRepo).deletePost({
     *         id: 1,
     *         userId: 2
     *       })).rejects.toMatchObject({
     *         statusCode: 403,
     *         message: "User is not the owner of this post"
     *       })
     *     })
     */
  })
})
