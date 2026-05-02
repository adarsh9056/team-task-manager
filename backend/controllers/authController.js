const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (user) =>
  jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const register = (prisma) => {
  return async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          data: {},
          message: "Email is already registered",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: { id: true, name: true, email: true, createdAt: true },
      });

      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        data: { token, user },
        message: "User registered successfully",
      });
    } catch (error) {
      return next(error);
    }
  };
};

const login = (prisma) => {
  return async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const userWithPassword = await prisma.user.findUnique({ where: { email } });
      if (!userWithPassword) {
        return res.status(401).json({
          success: false,
          data: {},
          message: "Invalid email or password",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, userWithPassword.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          data: {},
          message: "Invalid email or password",
        });
      }

      const user = {
        id: userWithPassword.id,
        name: userWithPassword.name,
        email: userWithPassword.email,
        createdAt: userWithPassword.createdAt,
      };

      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        data: { token, user },
        message: "Login successful",
      });
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = {
  register,
  login,
};
