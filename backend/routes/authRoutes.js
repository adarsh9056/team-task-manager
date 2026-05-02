const express = require("express");
const { body } = require("express-validator");
const { register, login } = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");

module.exports = (prisma) => {
  const router = express.Router();

  router.post(
    "/register",
    [
      body("name").trim().notEmpty().withMessage("Name is required"),
      body("email").isEmail().withMessage("Valid email is required"),
      body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
      validateRequest,
    ],
    register(prisma)
  );

  router.post(
    "/login",
    [
      body("email").isEmail().withMessage("Valid email is required"),
      body("password").notEmpty().withMessage("Password is required"),
      validateRequest,
    ],
    login(prisma)
  );

  return router;
};
