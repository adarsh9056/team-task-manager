const express = require("express");
const { body, param } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTaskStatus,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const dueDateValidator = body("dueDate")
  .optional({ nullable: true })
  .isISO8601()
  .withMessage("Due date must be a valid ISO date")
  .custom((value) => {
    if (value && new Date(value) < new Date()) {
      throw new Error("Due date cannot be in the past");
    }
    return true;
  });

module.exports = (prisma) => {
  const router = express.Router();

  router.use(authMiddleware);

  router.post(
    "/",
    [
      body("title").trim().notEmpty().withMessage("Task title is required"),
      body("description").optional().isString().withMessage("Description must be text"),
      dueDateValidator,
      body("priority")
        .optional()
        .isIn(["LOW", "MEDIUM", "HIGH"])
        .withMessage("Priority must be LOW, MEDIUM, or HIGH"),
      body("projectId").notEmpty().withMessage("Project ID is required"),
      body("assignedTo").optional({ nullable: true }).isString(),
      validateRequest,
    ],
    createTask(prisma)
  );

  router.get(
    "/project/:id",
    [param("id").notEmpty().withMessage("Project ID is required"), validateRequest],
    getTasksByProject(prisma)
  );

  router.get(
    "/:id",
    [param("id").notEmpty().withMessage("Task ID is required"), validateRequest],
    getTaskById(prisma)
  );

  router.patch(
    "/:id/status",
    [
      param("id").notEmpty().withMessage("Task ID is required"),
      body("status")
        .notEmpty()
        .isIn(["TODO", "IN_PROGRESS", "DONE"])
        .withMessage("Status must be TODO, IN_PROGRESS, or DONE"),
      validateRequest,
    ],
    updateTaskStatus(prisma)
  );

  router.patch(
    "/:id",
    [
      param("id").notEmpty().withMessage("Task ID is required"),
      body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
      body("description").optional({ nullable: true }).isString(),
      dueDateValidator,
      body("priority").optional().isIn(["LOW", "MEDIUM", "HIGH"]),
      body("status").optional().isIn(["TODO", "IN_PROGRESS", "DONE"]),
      body("assignedTo").optional({ nullable: true }).isString(),
      validateRequest,
    ],
    updateTask(prisma)
  );

  router.delete(
    "/:id",
    [param("id").notEmpty().withMessage("Task ID is required"), validateRequest],
    deleteTask(prisma)
  );

  return router;
};
