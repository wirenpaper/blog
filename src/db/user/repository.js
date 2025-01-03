/**
 * This is a "factory" function:
 * - It takes a `sqlClient` (like your "sql" import) as a parameter.
 * - Returns an object with repository methods (e.g., createUser).
 */
export function userRepository(sqlClient) {
  return {
    /**
     * Insert a new user into the database.
     */
    async createUser({ username, hashedPassword, firstname, lastname }) {
      try {
        // Using the injected `sqlClient` instead of a direct import
        const [newUser] = await sqlClient`
          INSERT INTO users (username, password, firstname, lastname)
          VALUES (${username}, ${hashedPassword}, ${firstname}, ${lastname})
          RETURNING id
        `
        return newUser;
      } catch (error) {
        console.error('Error in createUser:', error)
        throw error
      }
    },

    async getUsersByUsername({ username }) {
      try {
        const [users] = await sqlClient`
          SELECT id, username, password, firstname, lastname
          FROM users
          WHERE username = ${username}
        `
        return users
      } catch (error) {
        console.error("Error in fetching users:", error)
        throw error
      }
    },

    async getUserById({ reqUserId }) {
      try {
        const [user] = await sqlClient`
          SELECT id, password
          FROM users
          WHERE id = ${reqUserId}
        `
        return user

      } catch (error) {
        console.error("Error in fetching user:", error)
        throw error
      }
    },

    async updateUserResetToken({ resetTokenHash, expiryTime, userId }) {
      try {
        await sqlClient`
          UPDATE users
          SET reset_token = ${resetTokenHash},
              reset_token_expires = ${expiryTime}
          WHERE id = ${userId}
        `
      } catch (error) {
        console.error("Error in updating user reset token:", error)
        throw error
      }
    },

    // all users who have a reset token set basically
    async getResetTokens() {
      try {
        const [users] = await sqlClient`
          SELECT id, reset_token
          FROM users
          WHERE reset_token IS NOT NULL
          AND reset_token_expires > NOW()
        `
        return [users]
      } catch {

        console.error("Error getting reset tokens:", error)
        throw error
      }
    },

    async updateTokenVerified({ foundUserId }) {
      try {
        await sqlClient`
          UPDATE users
          SET token_verified = true
          WHERE id = ${foundUserId}
        `
      } catch (error) {
        console.error("Error updating token verification to true:", error)
        throw error
      }
    },

    async getUserByVerifiedToken({ username }) {
      try {
        const [user] = await sqlClient`
          SELECT id, reset_token
          FROM users
          WHERE reset_token_expires > NOW()
          AND token_verified = true
          AND username = ${username}
        `
        return user
      } catch (error) {
        console.error("Error getting users:", error)
        throw error
      }
    },

    async updateUserPassword({ hashedPassword, userId }) {
      try {
        await sqlClient`
          UPDATE users
          SET password = ${hashedPassword},
              reset_token = NULL,
              reset_token_expires = NULL,
              token_verified = false
          WHERE id = ${userId}
        `
      } catch (error) {
        console.error("Error, could not update password:", error)
        throw error
      }
    },

    async updateLoggedInUserPassword({ hashedPassword, userId }) {
      try {
        await sqlClient`
          UPDATE users
          SET password = ${hashedPassword}
          WHERE id = ${userId}
      `
      } catch (error) {
        console.log("Error, could not update logged in user password:", error)
        throw error
      }
    }

  };
}
