const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    
   

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }




    const decoded = jwt.verify(token, process.env.JWT_SECRET);

  

    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = protect;