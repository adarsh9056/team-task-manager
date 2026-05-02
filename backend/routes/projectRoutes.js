const express = require("express");
const { body, param } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const isProjectAdmin = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember,
} = require("../controllers/projectController");

module.exports = (prisma) => {
  const router = express.Router();

  router.use(authMiddleware);

  router.post(
    "/",
    [
      body("name").trim().notEmpty().withMessage("Project name is required"),
      body("description").optional().isString().withMessage("Description must be text"),
      validateRequest,
    ],
    createProject(prisma)
  );

  router.get("/", getProjects(prisma));

  router.get(
    "/:id",
    [param("id").notEmpty().withMessage("Project ID is required"), validateRequest],
    getProjectById(prisma)
  );

  router.post(
    "/:id/members",
    [
      param("id").notEmpty().withMessage("Project ID is required"),
      body("email").isEmail().withMessage("Valid member email is required"),
      validateRequest,
    ],
    isProjectAdmin(prisma),
    addMember(prisma)
  );

  router.delete(
    "/:id/members/:userId",
    [
      param("id").notEmpty().withMessage("Project ID is required"),
      param("userId").notEmpty().withMessage("User ID is required"),
      validateRequest,
    ],
    isProjectAdmin(prisma),
    removeMember(prisma)
  );

  return router;
};
