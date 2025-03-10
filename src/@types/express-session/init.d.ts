import session from "express-session"

// 1. Extend the built-in session data if you store extra properties
declare module "express-session" {
  interface SessionData {
    userId?: number;
    // Add any other fields you store on the session
  }
}

// 2. Augment the Express Request type to include `session`
declare module "express-serve-static-core" {
  interface Request {
    // By default, `session` might not exist (e.g. if no session middleware),
    // so make it optional:
    session?: session.Session & Partial<session.SessionData>;
  }
}
