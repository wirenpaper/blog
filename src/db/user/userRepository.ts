import { PostgresClient } from "@src/db.js"
import { createUser, UserModel } from "@db/user/userModel.js"
import { isExpressError, createExpressError, postgresStatusCode } from "@src/errors.js"

export interface CreateUserParams {
  userName: string
  hashedPassword: string
  firstName?: string
  lastName?: string
}

export interface GetUserByUsernameResult {
  id: number
  userName: string
  hashedPassword: string
  firstName?: string
  lastName?: string
}

export interface GetUserByIdResult {
  id: number
  hashedPassword?: string
}

export interface UpdateResetTokenParams {
  resetTokenHash: string
  expiryTime: Date
  userId: number
}

export interface GetResetTokenResult {
  id: number
  resetToken: string
}

interface UpdateUserPasswordParams {
  hashedPassword: string
  userId: number
}

export interface UserRepository {
  createUser: (params: CreateUserParams) => Promise<UserModel>
  // usernames gotta be unique
  getUserByUsername: (params: { userName: string }) => Promise<GetUserByUsernameResult | undefined>
  getUserById: (params: { userId: number }) => Promise<GetUserByIdResult>
  updateUserResetToken: (params: UpdateResetTokenParams) => Promise<void>
  getResetToken: (params: { userName: string }) => Promise<GetResetTokenResult | undefined>
  updateUserPassword: (params: UpdateUserPasswordParams) => Promise<void>
  updateLoggedInUserPassword: (params: UpdateUserPasswordParams) => Promise<void>
  deleteUserById: (params: { userId: number }) => Promise<void>
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
        const res: UserModel[] = await sqlClient`
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
        if (res.length !== 1)
          throw createExpressError(500, "should be *exactly* 1 row")

        return createUser(res[0])
      } catch (error) {
        if (isExpressError(error as Error))
          throw error

        const e = error as { code?: string; message: string }

        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    // usernames gotta be unique
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
          throw createExpressError(500, "should be 0 or 1 rows")

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

        if (res.length !== 1)
          throw createExpressError(500, "should be *exactly* 1 row")

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
        const res: { id: number }[] = await sqlClient`
          update users
          set reset_token = ${resetTokenHash}, reset_token_expires = ${expiryTime}
          where id = ${userId}
          returning id
          `
        if (res.length !== 1)
          throw createExpressError(500, "should be *exactly* 1 row")

      } catch (error) {
        if (isExpressError(error as Error))
          throw error

        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async getResetToken({ userName }) {
      try {
        const user: GetResetTokenResult[] = await sqlClient`
        select
          id,
          reset_token as "resetToken"
          from users
          where reset_token_expires > now()
          and user_name = ${userName}
        `

        if (user.length > 1) {
          throw createExpressError(500, "should be 0 or 1 rows")
        }

        return user[0]
      } catch (error) {
        if (isExpressError(error as Error))
          throw error

        const e = error as { code?: string; message: string }

        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async updateUserPassword({ hashedPassword, userId }) {
      try {
        const res: { id: number }[] = await sqlClient`
          update users
          set hashed_password = ${hashedPassword},
          reset_token = null,
          reset_token_expires = null
          where id = ${userId}
          returning id
          `
        if (res.length === 0)
          throw createExpressError(500, "password not reset")

        if (res.length > 1)
          throw createExpressError(500, "more than one password reset") // didnt test

      } catch (error) {
        if (isExpressError(error as Error))
          throw error

        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async updateLoggedInUserPassword({ hashedPassword, userId }) {
      try {
        const res: { id: number }[] = await sqlClient`
              update users
              set hashed_password = ${hashedPassword}
              where id = ${userId}
              returning id
          `
        if (res.length !== 1)
          throw createExpressError(500, "should be *exactly* 1 row")

      } catch (error) {
        if (isExpressError(error as Error))
          throw error
        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async deleteUserById({ userId }) {
      try {
        const res: { id: number }[] = await sqlClient`
          delete from users where id=${userId}
          returning id
        `
        if (res.length < 1)
          throw createExpressError(500, "no rows deleted")
        if (res.length > 1)
          throw createExpressError(500, "fatal error; multiple results")

      } catch (error) {
        if (isExpressError(error as Error))
          throw error
        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    }
  }
}
