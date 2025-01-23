import { Router, Request } from "express";
import { makeLoginService } from "./login_service.js"
import { UserRepository } from "../../../db/user/user_repository.js";
import { PostgressDBError, JWTError, UserError } from "../../../errors.js";

interface MakeLoginRequest {
  userName: string,
  password: string
}

export function makeLoginRouter(userRepo: UserRepository) {
  const loginService = makeLoginService(userRepo)

  return Router().post("/", async (req: Request<object, object, MakeLoginRequest>, res) => {
    const { userName, password } = req.body
    try {
      const result = await loginService.loginUser({ userName, password })

      res.json({ token: result.token, userWithoutPassword: result.userWithoutPassword })
    } catch (error) {
      if (error instanceof PostgressDBError || error instanceof JWTError || error instanceof UserError) {
        const { statusCode, message, func } = error;
        res.status(statusCode).json({ func, message });
        return
      }
      res.status(500).json({ message: (error as Error).message })
    }
  })
}
