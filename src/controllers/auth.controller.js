const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, apartmentUnit, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  if (!req.file) {
    throw new ApiError(400, 'Verification document (lease/ID) is required for tenant registration');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'tenant', // hardcoded — public register can never create staff/admin
    apartmentUnit,
    phone,
    verificationDocument: { url: req.file.path, publicId: req.file.filename },
  });

  res.status(201).json(
    new ApiResponse(
      201,
      { id: user._id, email: user.email, verificationStatus: user.verificationStatus },
      'Registered successfully. Your account is pending admin verification.'
    )
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  if (user.verificationStatus === 'pending') {
    throw new ApiError(403, 'Your account is pending admin verification');
  }
  if (user.verificationStatus === 'rejected') {
    throw new ApiError(403, `Your account verification was rejected: ${user.rejectionReason || 'No reason provided'}`);
  }

  const token = generateToken(user._id, user.role);
  res.status(200).json(
    new ApiResponse(200, { user: { id: user._id, name: user.name, role: user.role }, token }, 'Login successful')
  );
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json(new ApiResponse(200, user, 'User fetched successfully'));
});

const createStaffOrAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const user = await User.create({
    name,
    email,
    password,
    role, // 'staff' or 'admin' — validated by Joi to only allow these two
    phone,
  });

  res.status(201).json(
    new ApiResponse(201, { id: user._id, name: user.name, email: user.email, role: user.role }, `${role} account created successfully`)
  );
});

module.exports = { register, login, getMe, createStaffOrAdmin };