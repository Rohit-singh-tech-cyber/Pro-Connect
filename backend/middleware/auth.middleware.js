import User from "../models/user.model.js";

export const authenticateUser = async (req, res, next) => {
  try {
   console.log("AUTH HEADER =", req.headers.authorization);
    // Token can come from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    // Expected:
    // Authorization: Bearer <token>

    const parts = authHeader.split(" ");

  console.log("AUTH PARTS =", parts);

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        message: "Invalid authorization format"
      });
    }

    const token = parts[1];


     console.log("AUTH TOKEN =", token);


    if (!token) {
      return res.status(401).json({
        message: "Authentication token missing"
      });
    }

    // Find user using token
    const user = await User.findOne({
      token: token
    });

       console.log("FOUND USER =", user);


    if (!user) {
      return res.status(401).json({
        message: "Invalid or expired token"
      });
    }

    // Attach user to request
    req.user = user;

    next();

  } catch (error) {

    console.log("AUTH MIDDLEWARE ERROR =", error);

    return res.status(500).json({
      message: "Authentication failed"
    });

  }
};