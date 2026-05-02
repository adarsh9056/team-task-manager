const isProjectAdmin = (prisma) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.body.projectId;

      if (!projectId) {
        return res
          .status(400)
          .json({ success: false, data: {}, message: "Project ID is required" });
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: req.user.id,
            projectId,
          },
        },
      });

      if (!membership) {
        return res
          .status(403)
          .json({ success: false, data: {}, message: "You are not a member of this project" });
      }

      if (membership.role !== "ADMIN") {
        return res
          .status(403)
          .json({ success: false, data: {}, message: "Admin role required" });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = isProjectAdmin;
