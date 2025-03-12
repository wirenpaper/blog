import { createUser as createUserModel } from "@db/user/user_model.js"
import { PostgresClient } from "@src/db.js"
import { UserModel } from "@db/user/user_model.js"
import { isExpressError, createExpressError, postgresStatusCode, PostgressDBError } from "@src/errors.js"

interface CreateUserParams {
  userName: string
  hashedPassword: string
  firstName?: string | null
  lastName?: string | null
}

interface GetUserByUsernameResult {
  id: number
  userName: string
  hashedPassword: string
  firstName: string | null
  lastName: string | null
}

interface GetUserByIdResult {
  id: number
  hashedPassword: string | null
}

interface UpdateResetTokenParams {
  resetTokenHash: string
  expiryTime: Date
  userId: number
}

interface GetResetTokensResult {
  id: number
  resetToken: string
}

interface GetUserByVerifiedTokenResult {
  id: number
  resetToken: string
}

interface UpdateUserPasswordParams {
  hashedPassword: string
  userId: number
}

export interface UserRepository {
  createUser: (params: CreateUserParams) => Promise<UserModel | undefined>
  getUserByUsername: (params: { userName: string }) => Promise<GetUserByUsernameResult | undefined>
  getUserById: (params: { userId: number }) => Promise<GetUserByIdResult | undefined>
  updateUserResetToken: (params: UpdateResetTokenParams) => Promise<void>
  getResetTokens: () => Promise<GetResetTokensResult[]>
  updateTokenVerified: (params: { userId: number }) => Promise<void>
  getUserByVerifiedToken: (params: { userName: string }) => Promise<GetUserByVerifiedTokenResult | undefined>
  updateUserPassword: (params: UpdateUserPasswordParams) => Promise<void>
  updateLoggedInUserPassword: (params: UpdateUserPasswordParams) => Promise<void>
}

export function userRepository(sqlClient: PostgresClient): UserRepository {
  return {
    async createUser({
      userName,
      hashedPassword,
      firstName,
      lastName
    }) {
      try {
        const res = await sqlClient`
                insert into users (user_name, hashed_password, first_name, last_name)
                values (
                  ${userName},
                  ${hashedPassword},
                  ${firstName === undefined || firstName === "" ? null : firstName},
                  ${lastName === undefined || lastName === "" ? null : lastName}
                )
                returning
                  id,
                  user_name as "userName",
                  hashed_password as "hashedPassword",
                  first_name as "firstName",
                  last_name as "lastName"
              `
        if (res.length > 1)
          throw createExpressError(500, "should be only 1 row")

        return createUserModel(res[0] as UserModel)
      } catch (error) {
        if (isExpressError(error as Error))
          throw error

        const e = error as { code?: string; message: string }

        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async getUserByUsername({ userName }) {
      try {
        const res: GetUserByUsernameResult[] = await sqlClient`
          select
            id,
            user_name as "userName",
            hashed_password as "hashedPassword",
            first_name as "firstName",
            last_name as "lastName"
          from users
          where user_name = ${userName}
        `
        if (res.length > 1)
          throw createExpressError(500, "should be only 1 row")

        return res[0]
      } catch (error) {
        if (isExpressError(error as Error))
          throw error

        const e = error as { code?: string; message: string }

        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async getUserById({ userId }) {
      try {
        const res: GetUserByIdResult[] = await sqlClient`
          select
            id,
            hashed_password as "hashedPassword"
          from users
          where id = ${userId}
        `

        if (res.length > 1)
          throw createExpressError(500, "should be only 1 row")

        return res[0]
      } catch (error) {
        if (isExpressError(error as Error))
          throw error

        const e = error as { code?: string; message: string }

        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async updateUserResetToken({ resetTokenHash, expiryTime, userId }) {
      try {
        await sqlClient`
          update users
          set reset_token = ${resetTokenHash},
              reset_token_expires = ${expiryTime}
          where id = ${userId}
        `
      } catch (error) {
        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    // all users who have a reset token set basically
    async getResetTokens() {
      try {
        const users: GetResetTokensResult[] = await sqlClient`
          select
            id,
            reset_token as "resetToken"
          from users
          where reset_token is not null
          and reset_token_expires > now()
        `
        return users
      } catch (error) {
        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async updateTokenVerified({ userId }) {
      try {
        await sqlClient`
          update users
          set token_verified = true
          where id = ${userId}
        `
      } catch (error) {
        throw new PostgressDBError(error, this.updateTokenVerified)
      }
    },

    async getUserByVerifiedToken({ userName }) {
      try {
        const [user]: [GetUserByVerifiedTokenResult | undefined] = await sqlClient`
          select
            id,
            reset_token as "resetToken"
          from users
          where reset_token_expires > now()
          and token_verified = true
          and user_name = ${userName}
        `
        return user
      } catch (error) {
        throw new PostgressDBError(error, this.getUserByVerifiedToken)
      }
    },

    async updateUserPassword({ hashedPassword, userId }) {
      try {
        await sqlClient`
          update users
          set hashed_password = ${hashedPassword},
              reset_token = null,
              reset_token_expires = null,
              token_verified = false
          where id = ${userId}
        `
      } catch (error) {
        throw new PostgressDBError(error, this.updateUserPassword)
      }
    },

    async updateLoggedInUserPassword({ hashedPassword, userId }) {
      try {
        await sqlClient`
          update users
          set hashed_password = ${hashedPassword}
          where id = ${userId}
      `
      } catch (error) {
        throw new PostgressDBError(error, this.updateLoggedInUserPassword)
      }
    }
  }
}
