import { isValidPassword } from "../../../db/user/user_model.js"

export function mockIsValidPassword(inv: boolean) {
  jest.mock("../../../db/user/user_model.js", () => {
    const actualUserModel = jest.requireActual<typeof import("../../../db/user/user_model.js")>(
      "../../../db/user/user_model.js"
    )

    return {
      ...actualUserModel,
      isValidPassword: jest.fn(() => inv) as typeof isValidPassword,
    }
  })
}
