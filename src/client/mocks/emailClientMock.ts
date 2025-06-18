import { EmailClient } from "@client/emailClient.js"

export const mockEmailClient: jest.Mocked<EmailClient> = {
  sendPasswordResetEmail: jest.fn()
}
