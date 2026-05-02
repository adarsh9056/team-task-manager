const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getDashboard } = require("../controllers/dashboardController");

module.exports = (prisma) => {
  const router = express.Router();

  router.use(authMiddleware);
  router.get("/", getDashboard(prisma));

  return router;
};
