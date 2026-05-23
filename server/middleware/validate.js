import validator from 'validator';

// Validate registration input
export const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) errors.push('Name is required');
  if (!email || !validator.isEmail(email)) errors.push('Valid email is required');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters');

  const validRoles = ['admin', 'donor', 'hospital', 'staff'];
  if (role && !validRoles.includes(role)) errors.push('Invalid role');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }
  next();
};

// Validate login input
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) errors.push('Valid email is required');
  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }
  next();
};

// Validate blood request
export const validateBloodRequest = (req, res, next) => {
  const { patientName, bloodGroup, quantity, reason } = req.body;
  const errors = [];

  if (!patientName) errors.push('Patient name is required');
  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (!bloodGroup || !validGroups.includes(bloodGroup)) errors.push('Valid blood group is required');
  if (!quantity || quantity < 1) errors.push('Quantity must be at least 1');
  if (!reason) errors.push('Reason is required');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }
  next();
};

// Validate donor profile
export const validateDonor = (req, res, next) => {
  const { fullName, phone, gender, bloodGroup, dateOfBirth, weight } = req.body;
  const errors = [];

  if (!fullName) errors.push('Full name is required');
  if (!phone) errors.push('Phone number is required');
  if (!gender) errors.push('Gender is required');
  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (!bloodGroup || !validGroups.includes(bloodGroup)) errors.push('Valid blood group is required');
  if (!dateOfBirth) errors.push('Date of birth is required');
  if (!weight || weight < 45) errors.push('Weight must be at least 45 kg');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }
  next();
};

// Generic ObjectId validation
export const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  next();
};

// Validate branch registration
export const validateBranch = (req, res, next) => {
  const { name, email, phone, address, latitude, longitude, registrationNumber } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) errors.push('Branch name is required');
  if (!email || !validator.isEmail(email)) errors.push('Valid email is required');
  if (!phone) errors.push('Phone number is required');
  if (!registrationNumber) errors.push('Registration number is required');
  
  if (!address) {
    errors.push('Address is required');
  } else {
    const { street, city, state, pincode } = address;
    if (!street || street.trim().length === 0) errors.push('Street is required');
    if (!city || city.trim().length === 0) errors.push('City is required');
    if (!state || state.trim().length === 0) errors.push('State is required');
    if (!pincode || !/^\d{6}$/.test(pincode)) errors.push('Valid 6-digit Indian pincode is required');
  }

  // Latitude and Longitude validation
  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);

  if (isNaN(latNum) || latNum < -90 || latNum > 90) {
    errors.push('Latitude must be a valid number between -90 and 90');
  }
  if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
    errors.push('Longitude must be a valid number between -180 and 180');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }
  next();
};

// Validate camp creation
export const validateCamp = (req, res, next) => {
  const { name, organizer, branchId, date, startTime, endTime, maxDonors, address, latitude, longitude } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) errors.push('Camp name is required');
  if (!organizer || organizer.trim().length === 0) errors.push('Organizer name is required');
  if (!branchId || !branchId.match(/^[0-9a-fA-F]{24}$/)) errors.push('Valid branch ID is required');
  if (!date) errors.push('Camp date is required');
  if (!startTime) errors.push('Start time is required');
  if (!endTime) errors.push('End time is required');
  
  const capacity = parseInt(maxDonors);
  if (isNaN(capacity) || capacity < 1) errors.push('Maximum donor capacity must be at least 1');

  if (!address) {
    errors.push('Address is required');
  } else {
    const { street, city, state, pincode } = address;
    if (!street || street.trim().length === 0) errors.push('Street is required');
    if (!city || city.trim().length === 0) errors.push('City is required');
    if (!state || state.trim().length === 0) errors.push('State is required');
    if (!pincode || !/^\d{6}$/.test(pincode)) errors.push('Valid 6-digit Indian pincode is required');
  }

  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);

  if (isNaN(latNum) || latNum < -90 || latNum > 90) {
    errors.push('Latitude must be a valid number between -90 and 90');
  }
  if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
    errors.push('Longitude must be a valid number between -180 and 180');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }
  next();
};
