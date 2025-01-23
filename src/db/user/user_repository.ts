import { createUser as createUserModel } from "./user_model.js";
import { PostgresClient } from "../../db.js";
import { UserModel } from "./user_model.js";
import { PostgressDBError } from "../../errors.js";

interface CreateUserParams {
  userName: string
  hashedPassword: string
  firstName?: string | null
  lastName?: string | null
}

interface GetUserByUsernameResult {
  id: number
  resultToken: string
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
        const [row] = await sqlClient`
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
        return createUserModel(row as UserModel);
      } catch (error) {
        throw new PostgressDBError(error, this.createUser)
      }
    },

    async getUserByUsername({ userName }) {
      try {
        const [row]: [GetUserByUsernameResult | undefined] = await sqlClient`
          select
            id,
            user_name as "userName",
            hashed_password as "hashedPassword",
            first_name as "firstName",
            last_name as "lastName"
          from users
          where user_name = ${userName}
        `
        return row
      } catch (error) {
        throw new PostgressDBError(error, this.getUserByUsername)
      }
    },

    async getUserById({ userId }) {
      try {
        const [user]: [GetUserByIdResult | undefined] = await sqlClient`
          select
            id,
            hashed_password as "hashedPassword"
          from users
          where id = ${userId}
        `
        return user
      } catch (error) {
        throw new PostgressDBError(error, this.getUserById)
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
        throw new PostgressDBError(error, this.updateUserResetToken)
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
        throw new PostgressDBError(error, this.getResetTokens)
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
