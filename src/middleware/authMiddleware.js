import jwt from "jsonwebtoken"

function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]

  if (!token) {
    res.status(401).json({ message: "No token provided" })
    return
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      res.status(401).json({ message: "Invalid token" })
      return
    }
    req.userId = decoded.id
    next()
  })
}

export default authMiddleware
