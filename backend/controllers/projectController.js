const createProject = (prisma) => {
  return async (req, res, next) => {
    try {
      const { name, description } = req.body;

      const project = await prisma.project.create({
        data: {
          name,
          description,
          members: {
            create: {
              userId: req.user.id,
              role: "ADMIN",
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      return res.status(201).json({
        success: true,
        data: project,
        message: "Project created successfully",
      });
    } catch (error) {
      return next(error);
    }
  };
};

const getProjects = (prisma) => {
  return async (req, res, next) => {
    try {
      const projects = await prisma.project.findMany({
        where: {
          members: {
            some: {
              userId: req.user.id,
            },
          },
        },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        success: true,
        data: projects,
        message: "Projects fetched successfully",
      });
    } catch (error) {
      return next(error);
    }
  };
};

const getProjectById = (prisma) => {
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

      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          tasks: {
            include: {
              assignee: {
                select: { id: true, name: true, email: true },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          data: {},
          message: "Project not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: project,
        message: "Project fetched successfully",
      });
    } catch (error) {
      return next(error);
    }
  };
};

const addMember = (prisma) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const { email } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({
          success: false,
          data: {},
          message: "User not found",
        });
      }

      const existingMember = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId: id,
          },
        },
      });

      if (existingMember) {
        return res.status(409).json({
          success: false,
          data: {},
          message: "User is already a project member",
        });
      }

      const member = await prisma.projectMember.create({
        data: {
          userId: user.id,
          projectId: id,
          role: "MEMBER",
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      return res.status(201).json({
        success: true,
        data: member,
        message: "Member added successfully",
      });
    } catch (error) {
      return next(error);
    }
  };
};

const removeMember = (prisma) => {
  return async (req, res, next) => {
    try {
      const { id, userId } = req.params;

      const member = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId: id,
          },
        },
      });

      if (!member) {
        return res.status(404).json({
          success: false,
          data: {},
          message: "Member not found in project",
        });
      }

      if (member.role === "ADMIN") {
        return res.status(400).json({
          success: false,
          data: {},
          message: "Cannot remove an admin from project",
        });
      }

      await prisma.projectMember.delete({ where: { id: member.id } });

      return res.status(200).json({
        success: true,
        data: {},
        message: "Member removed successfully",
      });
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember,
};
