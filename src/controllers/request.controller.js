const MaintenanceRequest = require('../models/MaintenanceRequest');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiFeatures = require('../utils/apiFeatures');
const cloudinary = require('../config/cloudinary');
const { createNotification } = require('./notification.controller');

// CREATE — tenant only
const createRequest = asyncHandler(async (req, res) => {
  const { title, description, category, priority } = req.body;

  const images = (req.files || []).map((file) => ({
    url: file.path,
    publicId: file.filename,
  }));

  const request = await MaintenanceRequest.create({
    tenantId: req.user._id,
    title,
    description,
    category,
    priority,
    images,
  });

  res.status(201).json(new ApiResponse(201, request, 'Maintenance request created successfully'));
});

// LIST — scoped by role, with pagination/filter/sort/search
const getAllRequests = asyncHandler(async (req, res) => {
  let baseFilter = {};

  if (req.user.role === 'tenant') {
    baseFilter = { tenantId: req.user._id };
  } else if (req.user.role === 'staff') {
    baseFilter = { assignedTo: req.user._id };
  }
  // admin sees everything — baseFilter stays {}

  const features = new ApiFeatures(MaintenanceRequest.find(baseFilter), req.query)
    .filter()
    .search(['title', 'description'])
    .sort()
    .paginate();

  const requests = await features.query.populate('tenantId', 'name email apartmentUnit').populate('assignedTo', 'name email');

  const total = await MaintenanceRequest.countDocuments(baseFilter);

  res.status(200).json(
    new ApiResponse(200, { results: requests.length, total, requests }, 'Requests fetched successfully')
  );
});

// GET ONE
const getRequestById = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.findById(req.params.id)
    .populate('tenantId', 'name email apartmentUnit')
    .populate('assignedTo', 'name email');

  if (!request) throw new ApiError(404, 'Maintenance request not found');

  const isOwner = request.tenantId._id.toString() === req.user._id.toString();
  const isAssignedStaff = request.assignedTo && request.assignedTo._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAssignedStaff && !isAdmin) {
    throw new ApiError(403, 'You do not have access to this request');
  }

  res.status(200).json(new ApiResponse(200, request, 'Request fetched successfully'));
});

// ASSIGN — admin only
const assignRequest = asyncHandler(async (req, res) => {
  const { staffId } = req.body;

  const staff = await User.findOne({ _id: staffId, role: 'staff' });
  if (!staff) throw new ApiError(404, 'Staff member not found');

  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Maintenance request not found');

  request.assignedTo = staffId;
  request.status = 'assigned';
  await request.save();

  await createNotification({
    userId: staffId,
    requestId: request._id,
    type: 'assigned',
    message: `You have been assigned to request: "${request.title}"`,
  });

  res.status(200).json(new ApiResponse(200, request, 'Request assigned successfully'));
});

// UPDATE STATUS — admin only
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Maintenance request not found');

  request.status = status;
  if (status === 'resolved') request.resolvedAt = new Date();
  await request.save();

  await createNotification({
    userId: request.tenantId,
    requestId: request._id,
    type: 'status_updated',
    message: `Your request "${request.title}" status changed to "${status}"`,
  });

  res.status(200).json(new ApiResponse(200, request, 'Status updated successfully'));
});

// DELETE — tenant (own, only if 'open') or admin (any)
const deleteRequest = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Maintenance request not found');

  const isOwner = request.tenantId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isAdmin) {
    if (!isOwner) throw new ApiError(403, 'You do not have permission to delete this request');
    if (request.status !== 'open') {
      throw new ApiError(400, 'You can only delete a request while it is still open');
    }
  }

  // Clean up Cloudinary images
  for (const image of request.images) {
    await cloudinary.uploader.destroy(image.publicId);
  }

  await request.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Request deleted successfully'));
});

module.exports = {
  createRequest,
  getAllRequests,
  getRequestById,
  assignRequest,
  updateStatus,
  deleteRequest,
};