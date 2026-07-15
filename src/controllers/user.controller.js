const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getPendingUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ verificationStatus: 'pending' }).select('-password');
  res.status(200).json(new ApiResponse(200, users, 'Pending users fetched'));
});

const verifyUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.verificationStatus = 'verified';
  user.rejectionReason = undefined;
  await user.save();

  res.status(200).json(new ApiResponse(200, user, 'User verified successfully'));
});

const rejectUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.verificationStatus = 'rejected';
  user.rejectionReason = reason || 'Not specified';
  await user.save();

  res.status(200).json(new ApiResponse(200, user, 'User rejected'));
});

module.exports = { getPendingUsers, verifyUser, rejectUser };