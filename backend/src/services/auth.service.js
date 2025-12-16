
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { config } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

const generateTokens = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiration,
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiration,
  });

  return { accessToken, refreshToken };
};

export const register = async (userData) => {
  const { username, email, password, fullName } = userData;

  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email },
      ],
    },
  });

  if (existingUser) {
    throw new ApiError(400, 'Username or email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      fullName,
      role: 'USER', // Default role
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

export const login = async (username, password) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Save refresh token (optional: store in database for token revocation)
  // For now, we'll just return it

  // Get user with branch info
  const userWithBranch = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  return {
    user: userWithBranch,
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    const { accessToken } = generateTokens(user);

    return { accessToken };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, 'Invalid refresh token');
    }
    throw error;
  }
};

