import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated',
      });
    }

    // Capture IP for audit logging
    req.clientIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Staff role permission check
export const authorizeStaffRole = (...staffRoles) => {
  return (req, res, next) => {
    // Admins always pass
    if (req.user.role === 'admin') return next();

    if (!req.user.staffRole || !staffRoles.includes(req.user.staffRole)) {
      return res.status(403).json({
        success: false,
        message: `Staff role '${req.user.staffRole}' is not authorized for this action`,
      });
    }
    next();
  };
};

// Middleware to isolate query parameters based on user's registered branch (staff & branch_admin)
export const isolateBranchAccess = (req, res, next) => {
  // Super Admin can access all branches
  if (req.user.role === 'admin') return next();

  if (['staff', 'branch_admin'].includes(req.user.role)) {
    if (!req.user.branchId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: User is not associated with any branch',
      });
    }
    
    // Auto-inject branch filter for queries
    req.branchFilter = { branchId: req.user.branchId };
    
    // Force branch association on created resources
    if (req.method === 'POST') {
      req.body.branchId = req.user.branchId.toString();
    }
  }
  next();
};

// Utility function to verify branch ownership of single documents
export const checkBranchMatch = (documentBranchId, user) => {
  if (user.role === 'admin') return true;
  if (!documentBranchId || !user.branchId) return false;
  return documentBranchId.toString() === user.branchId.toString();
};

