const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Internal helper — called from request.controller.js, not exposed as a route
const createNotification = async ({ userId, requestId, type, message }) => {
  await Notification.create({ userId, requestId, type, message });
};

// GET /notifications — logged-in user's own notifications
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .populate('requestId', 'title status')
    .sort('-createdAt');

  res.status(200).json(new ApiResponse(200, notifications, 'Notifications fetched successfully'));
});

// PATCH /notifications/:id/read — mark one as read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new ApiError(404, 'Notification not found');

  if (notification.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to modify this notification');
  }

  notification.read = true;
  await notification.save();

  res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
});

module.exports = { createNotification, getMyNotifications, markAsRead };