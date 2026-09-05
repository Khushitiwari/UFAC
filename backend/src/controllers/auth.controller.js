import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';

const BCRYPT_ROUNDS = 12;

export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, role: role || 'ACCOUNTANT' },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  sendResponse(res, new ApiResponse(201, user, 'User registered'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw new ApiError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Invalid credentials');

  const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRY,
  });

  sendResponse(
    res,
    new ApiResponse(200, {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        contactId: user.contactId,
      },
    }, 'Login successful'),
  );
});

export const me = asyncHandler(async (req, res) => {
  sendResponse(res, new ApiResponse(200, req.user));
});

export default { register, login, me };
