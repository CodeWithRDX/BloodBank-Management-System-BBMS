/**
 * branchAccess.js
 * Middleware to enforce branch-level data isolation.
 * Staff and branch_admin can only access their assigned branch's data.
 */

export const branchAccess = (req, res, next) => {
  // Admins have unrestricted access
  if (req.user.role === 'admin') return next();

  // For staff and branch_admin: inject branchId filter
  if (req.user.role === 'staff' || req.user.role === 'branch_admin') {
    if (!req.user.branchId) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to any branch. Contact admin.',
      });
    }
    // Inject branch filter into query params and body
    req.branchFilter = { branchId: req.user.branchId };
    req.userBranchId = req.user.branchId;
  }

  next();
};

/**
 * Enforce that a specific branchId param matches the user's branch (for staff)
 */
export const ownBranchOnly = (req, res, next) => {
  if (req.user.role === 'admin') return next();

  const targetBranchId = req.params.branchId || req.body.branchId;

  if (
    targetBranchId &&
    req.user.branchId &&
    targetBranchId.toString() !== req.user.branchId.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'You can only access your own branch data.',
    });
  }

  next();
};
