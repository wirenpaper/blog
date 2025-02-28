import { isValidPassword, sanitizeUser, UserModel } from "../user_model.js"

describe("User Model", () => {
  describe("isValidPassword", () => {
    it("should return false for passwords shorter than 8 characters", () => {
      expect(isValidPassword('Abc123')).toBe(false);
    })

    it("should return false for passwords without uppercase letters", () => {
      expect(isValidPassword('abcdefg123')).toBe(false);
    })

    it("should return false for passwords without lowercase letters", () => {
      expect(isValidPassword('ABCDEFG123')).toBe(false);
    })

    it("should return false for passwords without numbers", () => {
      expect(isValidPassword('AbcdefgHIJK')).toBe(false);
    })

    it("should return false for empty strings", () => {
      expect(isValidPassword("")).toBe(false)
    })

    it("should return false for null or undefined values", () => {
      expect(isValidPassword(null as unknown as string)).toBe(false);
      expect(isValidPassword(undefined as unknown as string)).toBe(false);
    })

    it("should return true for valid passwords", () => {
      expect(isValidPassword("Password123")).toBe(true);
      expect(isValidPassword("Abc12345")).toBe(true);
      expect(isValidPassword("StrongP4ssword")).toBe(true);
    })
  })

  describe("sanitizeUser", () => {
    test("should remove sensitive data from user object", () => {
      const user: UserModel = {
        id: 1,
        userName: "testuser",
        hashedPassword: "hashedpassword123",
        firstName: "Test",
        lastName: "User",
        resetToken: "sometoken123",
        resetTokenExpires: new Date(),
        tokenVerified: true
      }

      const sanitizedUser = sanitizeUser(user)

      // Check that sensitive fields are removed (using type assertions)
      expect("hashedPassword" in sanitizedUser).toBe(false)
      expect("resetToken" in sanitizedUser).toBe(false)
      expect("resetTokenExpires" in sanitizedUser).toBe(false)

      // Check that non-sensitive fields are kept
      expect(sanitizedUser.id).toBe(1)
      expect(sanitizedUser.userName).toBe("testuser")
      expect(sanitizedUser.firstName).toBe("Test")
      expect(sanitizedUser.lastName).toBe("User")
      expect(sanitizedUser.tokenVerified).toBe(true)
    });

    test("should handle partial user objects", () => {
      const partialUser: UserModel = {
        userName: "partialuser",
        hashedPassword: "hashedpassword456",
      };

      const sanitizedUser = sanitizeUser(partialUser)

      expect("hashedPassword" in sanitizedUser).toBe(false)
      expect(sanitizedUser.userName).toBe("partialuser")
      expect(sanitizedUser.id).toBeUndefined()
      expect(sanitizedUser.firstName).toBeUndefined()
      expect(sanitizedUser.lastName).toBeUndefined()
    });

    test("should handle user objects with null values", () => {
      const userWithNulls: UserModel = {
        userName: "nulluser",
        hashedPassword: "hashedpassword789",
        firstName: null,
        lastName: null
      }

      const sanitizedUser = sanitizeUser(userWithNulls)

      expect("hashedPassword" in sanitizedUser).toBe(false)
      expect(sanitizedUser.userName).toBe('nulluser')
      expect(sanitizedUser.firstName).toBeNull()
      expect(sanitizedUser.lastName).toBeNull()
    })
  })
})
