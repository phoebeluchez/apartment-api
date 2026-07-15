const Comment = require('../models/Comment');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Shared helper: confirms the user is allowed to interact with this request
const checkRequestAccess = async (request, user) => {
  const isOwner = request.tenantId.toString() === user._id.toString();
  const isAssignedStaff = request.assignedTo && request.assignedTo.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAssignedStaff && !isAdmin) {
    throw new ApiError(403, 'You do not have access to this request');
  }
};

// CREATE comment
const createComment = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { text } = req.body;

  const request = await MaintenanceRequest.findById(requestId);
  if (!request) throw new ApiError(404, 'Maintenance request not found');

  await checkRequestAccess(request, req.user);

  const comment = await Comment.create({
    requestId,
    authorId: req.user._id,
    text,
  });

  const populated = await comment.populate('authorId', 'name role');

  res.status(201).json(new ApiResponse(201, populated, 'Comment added successfully'));
});

// LIST comments for a request
const getCommentsForRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const request = await MaintenanceRequest.findById(requestId);
  if (!request) throw new ApiError(404, 'Maintenance request not found');

  await checkRequestAccess(request, req.user);

  const comments = await Comment.find({ requestId })
    .populate('authorId', 'name role')
    .sort('createdAt');

  res.status(200).json(new ApiResponse(200, comments, 'Comments fetched successfully'));
});

// DELETE comment — own comment, or admin can delete any
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found');

  const isAuthor = comment.authorId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isAuthor && !isAdmin) {
    throw new ApiError(403, 'You do not have permission to delete this comment');
  }

  await comment.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Comment deleted successfully'));
});

module.exports = { createComment, getCommentsForRequest, deleteComment };