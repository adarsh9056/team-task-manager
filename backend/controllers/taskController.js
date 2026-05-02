const createTask = (prisma) => {
  return async (req, res, next) => {
    try {
      const { title, description, dueDate, priority, projectId, assignedTo } = req.body;

      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: req.user.id,
            projectId,
          },
        },
      });

      if (!membership || membership.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          data: {},
          message: "Only project admins can create tasks",
        });
      }

      if (assignedTo) {
        const assigneeMembership = await prisma.projectMember.findUnique({
          where: {
            userId_projectId: {
              userId: assignedTo,
              projectId,
            },
          },
        });

        if (!assigneeMembership) {
          return res.status(400).json({
            success: false,
            data: {},
            message: "Assigned user must be a member of the project",
          });
        }
      }

      const task = await prisma.task.create({
        data: {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : null,
          priority,
          projectId,
          assignedTo: assignedTo || null,
        },
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      });

      return res.status(201).json({
        success: true,
        data: task,
        message: "Task created successfully",
      });
    } catch (error) {
      return next(error);
    }
  };
};

const getTasksByProject = (prisma) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;

      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: req.user.id,
            projectId: id,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          data: {},
          message: "You are not a member of this project",
        });
      }

      const tasks = await prisma.task.findMany({
        where: { projectId: id },
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({
        success: true,
        data: tasks,
        message: "Tasks fetched successfully",
      });
    } catch (error) {
      return next(error);
    }
  };
};

const getTaskById = (prisma) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;

      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          data: {},
          message: "Task not found",
        });
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: req.user.id,
            projectId: task.projectId,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          data: {},
          message: "You are not a member of this project",
        });
      }

      return res.status(200).json({
        success: true,
        data: task,
        message: "Task fetched successfully",
      });
    } catch (error) {
      return next(error);
    }
  };
};

const updateTaskStatus = (prisma) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const task = await prisma.task.findUnique({ where: { id } });
      if (!task) {
        return res.status(404).json({
          success: false,
          data: {},
          message: "Task not found",
        });
      }

      if (task.assignedTo !== req.user.id) {
        return res.status(403).json({
          success: false,
          data: {},
          message: "You can only update your assigned tasks",
        });
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: { status },
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: updatedTask,
        message: "Task status updated successfully",
      });
    } catch (error) {
      return next(error);
    }
  };
};

const updateTask = (prisma) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, description, dueDate, priority, status, assignedTo } = req.body;

      const task = await prisma.task.findUnique({ where: { id } });
      if (!task) {
        return res.status(404).json({
          success: false,
          data: {},
          message: "Task not found",
        });
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: req.user.id,
            projectId: task.projectId,
          },
        },
      });

      if (!membership || membership.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          data: {},
          message: "Only project admins can update tasks",
        });
      }

      if (assignedTo) {
        const assigneeMembership = await prisma.projectMember.findUnique({
          where: {
            userId_projectId: {
              userId: assignedTo,
              projectId: task.projectId,
            },
          },
        });

        if (!assigneeMembership) {
          return res.status(400).json({
            success: false,
            data: {},
            message: "Assigned user must be a member of the project",
          });
        }
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : null,
          priority,
          status,
          assignedTo: assignedTo === undefined ? task.assignedTo : assignedTo,
        },
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: updatedTask,
        message: "Task updated successfully",
      });
    } catch (error) {
      return next(error);
    }
  };
};

const deleteTask = (prisma) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;

      const task = await prisma.task.findUnique({ where: { id } });
      if (!task) {
        return res.status(404).json({
          success: false,
          data: {},
          message: "Task not found",
        });
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: req.user.id,
            projectId: task.projectId,
          },
        },
      });

      if (!membership || membership.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          data: {},
          message: "Only project admins can delete tasks",
        });
      }

      await prisma.task.delete({ where: { id } });

      return res.status(200).json({
        success: true,
        data: {},
        message: "Task deleted successfully",
      });
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
