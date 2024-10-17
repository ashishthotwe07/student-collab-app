import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token; // Get the token from cookies
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.student = decoded.student; // Attach student data to request
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

export default authMiddleware;
