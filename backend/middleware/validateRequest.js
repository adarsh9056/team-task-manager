const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: { errors: errors.array() },
      message: "Validation failed",
    });
  }
  return next();
};

module.exports = validateRequest;
