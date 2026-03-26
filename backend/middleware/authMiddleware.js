const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // 1. Get token from headers
  const authHeader = req.headers.authorization;

  // 2. Check if header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // 3. Extract the actual token string
  const token = authHeader.split(" ")[1];

  try {
    // 4. Verify token
    const JWT_SECRET = process.env.JWT_SECRET || "SECRETKEY";
    const decoded = jwt.verify(token, JWT_SECRET);

    // 5. Add user data to request object
    // Note: We use req.user to match your user.js logic: if (req.user.id !== req.params.id)
    req.user = decoded; 
    
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};