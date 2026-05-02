const getDashboard = (prisma) => {
  return async (req, res, next) => {
    try {
      const memberships = await prisma.projectMember.findMany({
        where: { userId: req.user.id },
        select: { projectId: true },
      });

      const projectIds = memberships.map((membership) => membership.projectId);

      const tasks = await prisma.task.findMany({
        where: {
          projectId: { in: projectIds },
        },
        include: {
          assignee: {
            select: { id: true, name: true },
          },
        },
      });

      const totalTasks = tasks.length;

      const tasksByStatus = {
        todo: tasks.filter((task) => task.status === "TODO").length,
        inProgress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
        done: tasks.filter((task) => task.status === "DONE").length,
      };

      const userMap = new Map();
      tasks.forEach((task) => {
        if (task.assignee) {
          const currentCount = userMap.get(task.assignee.name) || 0;
          userMap.set(task.assignee.name, currentCount + 1);
        }
      });

      const tasksPerUser = Array.from(userMap.entries()).map(([userName, count]) => ({
        userName,
        count,
      }));

      const now = new Date();
      const overdueTasks = tasks.filter(
        (task) => task.dueDate && new Date(task.dueDate) < now && task.status !== "DONE"
      );

      return res.status(200).json({
        success: true,
        data: {
          totalTasks,
          tasksByStatus,
          tasksPerUser,
          overdueTasks,
        },
        message: "Dashboard fetched successfully",
      });
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = {
  getDashboard,
};
