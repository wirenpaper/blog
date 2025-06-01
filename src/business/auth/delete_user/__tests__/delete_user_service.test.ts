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
        userId: 3
      })

      // Assert
      expect(result).toEqual(undefined)
    })

  })
})
