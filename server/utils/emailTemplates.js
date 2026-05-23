/**
 * Anime-themed Email Templates for MERN Blood Bank Management System (BBMS)
 * Themes:
 * - Crimson Red (Naruto Kyuubi / Emergency)
 * - Shadow Purple (Jujutsu Kaisen Domain Expansion / Admin)
 * - Amber Orange (Naruto Sage Mode / Warning)
 * - Forest Green (One Piece Zoro / Confirmation)
 * - Gold / Blue (Grand Line / Success)
 */

const getThemeStyles = (theme) => {
  let primaryColor = '#e5383b'; // Default red
  let headerGrad = 'linear-gradient(135deg, #a4161a 0%, #660708 100%)';
  let glowColor = 'rgba(229, 56, 59, 0.4)';
  let accentBorder = '#e5383b';

  if (theme === 'purple') { // Jujutsu Kaisen shadow domain
    primaryColor = '#8a2be2';
    headerGrad = 'linear-gradient(135deg, #4b0082 0%, #1a0033 100%)';
    glowColor = 'rgba(138, 43, 226, 0.4)';
    accentBorder = '#8a2be2';
  } else if (theme === 'orange') { // Naruto Sage Mode
    primaryColor = '#f77f00';
    headerGrad = 'linear-gradient(135deg, #fcbf49 0%, #d62828 100%)';
    glowColor = 'rgba(247, 127, 0, 0.4)';
    accentBorder = '#f77f00';
  } else if (theme === 'green') { // Zoro Slashing green
    primaryColor = '#2a9d8f';
    headerGrad = 'linear-gradient(135deg, #4ad66d 0%, #0c6123 100%)';
    glowColor = 'rgba(42, 157, 143, 0.4)';
    accentBorder = '#2a9d8f';
  } else if (theme === 'gold') { // One Piece Gold / Treasure
    primaryColor = '#ffb703';
    headerGrad = 'linear-gradient(135deg, #ffb703 0%, #fb8500 100%)';
    glowColor = 'rgba(255, 183, 3, 0.4)';
    accentBorder = '#ffb703';
  }

  return { primaryColor, headerGrad, glowColor, accentBorder };
};

const wrapHtml = (title, content, theme = 'red') => {
  const { primaryColor, headerGrad, glowColor, accentBorder } = getThemeStyles(theme);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b090a;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f5f3f4;
    }
    .wrapper {
      width: 100%;
      background-color: #0b090a;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #161a1d;
      border-radius: 16px;
      border: 2px solid ${accentBorder};
      box-shadow: 0 8px 32px ${glowColor};
      overflow: hidden;
    }
    .header {
      background: ${headerGrad};
      padding: 35px 20px;
      text-align: center;
      border-bottom: 2px solid ${accentBorder};
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      text-transform: uppercase;
      letter-spacing: 3px;
      text-shadow: 0 0 12px ${accentBorder};
    }
    .body {
      padding: 40px 30px;
      line-height: 1.7;
      font-size: 16px;
    }
    .footer {
      background-color: #0b090a;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #161a1d;
      font-size: 12px;
      color: #666;
    }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      background-color: ${primaryColor};
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 25px 0;
      box-shadow: 0 4px 15px ${glowColor};
      text-align: center;
    }
    .card {
      background-color: #0b090a;
      border-left: 4px solid ${accentBorder};
      padding: 20px;
      margin: 24px 0;
      border-radius: 0 12px 12px 0;
    }
    .label {
      font-weight: bold;
      color: ${primaryColor};
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      color: #fff;
      background-color: ${primaryColor};
    }
    hr {
      border: 0;
      border-top: 1px solid #333;
      margin: 25px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>🩸 BBMS / Crimson Code</h1>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>This is an automated notification from the Blood Bank Management System (BBMS).</p>
        <p>&copy; ${new Date().getFullYear()} BBMS - Crimson Code. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

// 1. Branch registration request (Admin Alert)
export const getBranchRegistrationTemplate = (branch) => {
  const content = `
    <h2>New Branch Registration Request</h2>
    <p>A new blood bank branch has submitted a registration request and requires admin approval. Expand your domain, Master Admin!</p>
    <div class="card">
      <p><span class="label">Branch Name:</span> ${branch.name}</p>
      <p><span class="label">Registration Number:</span> ${branch.registrationNumber}</p>
      <p><span class="label">Contact Email:</span> ${branch.email}</p>
      <p><span class="label">Contact Phone:</span> ${branch.phone}</p>
      <p><span class="label">Address:</span> ${branch.address.street}, ${branch.address.city}, ${branch.address.state} - ${branch.address.pincode}</p>
    </div>
    <p>Review this request in the Admin Dashboard to grant license and approve the branch.</p>
  `;
  return wrapHtml('New Branch Registration', content, 'purple');
};

// 2. Branch approval/rejection (Branch Manager)
export const getBranchStatusTemplate = (branch, status, reason = '') => {
  const isApproved = status === 'approved';
  const theme = isApproved ? 'green' : 'red';
  const statusBadge = isApproved ? 'APPROVED 🟢' : 'REJECTED 🔴';
  
  let customText = '';
  if (isApproved) {
    customText = `<p>Congratulations! Your branch has been officially approved. You can now access your manager console and begin saving lives. Time to build your squad!</p>`;
  } else {
    customText = `
      <p>We regret to inform you that your branch registration has been rejected.</p>
      ${reason ? `<p><span class="label">Reason:</span> ${reason}</p>` : ''}
      <p>Please address the issues listed above and resubmit your details.</p>
    `;
  }

  const content = `
    <h2>Branch Registration Status Update</h2>
    <p>Your registration request status has been updated: <span class="badge">${statusBadge}</span></p>
    <div class="card">
      <p><span class="label">Branch:</span> ${branch.name}</p>
      <p><span class="label">Registration Number:</span> ${branch.registrationNumber}</p>
    </div>
    ${customText}
  `;
  return wrapHtml('Branch Status Notification', content, theme);
};

// 3. Staff welcome email with credentials (Staff member)
export const getStaffWelcomeTemplate = (staff, password) => {
  const content = `
    <h2>Welcome to the Crimson Code Squad!</h2>
    <p>Hello <span class="label">${staff.name}</span>,</p>
    <p>You have been registered as a staff member for branch <span class="label">${staff.branchName || 'BBMS'}</span>. Here are your credentials to enter the console:</p>
    <div class="card">
      <p><span class="label">Sign-In Email:</span> ${staff.email}</p>
      <p><span class="label">Temporary Password:</span> <strong>${password}</strong></p>
      <p><span class="label">Role:</span> ${staff.role}</p>
    </div>
    <p>Please log in and update your password immediately to secure your access.</p>
  `;
  return wrapHtml('Staff Welcome Credentials', content, 'purple');
};

// 4. Appointment booking confirmation (Donor)
export const getAppointmentBookingTemplate = (appointment, branch) => {
  const content = `
    <h2>Blood Donation Appointment Booked!</h2>
    <p>Thank you for scheduling a donation. You are a true hero! Here are your appointment details:</p>
    <div class="card">
      <p><span class="label">Appointment ID:</span> ${appointment.appointmentId || 'N/A'}</p>
      <p><span class="label">Branch Name:</span> ${branch.name}</p>
      <p><span class="label">Date:</span> ${new Date(appointment.date).toLocaleDateString()}</p>
      <p><span class="label">Time slot:</span> ${appointment.slot || 'N/A'}</p>
      <p><span class="label">Address:</span> ${branch.address.street}, ${branch.address.city}, ${branch.address.state} - ${branch.address.pincode}</p>
    </div>
    <p>Please carry a valid photo ID and ensure you have eaten well prior to donation.</p>
  `;
  return wrapHtml('Appointment Confirmed', content, 'green');
};

// 5. Appointment approval/rejection status (Donor)
export const getAppointmentStatusTemplate = (appointment, branch, status, reason = '') => {
  const isApproved = status === 'approved';
  const theme = isApproved ? 'green' : 'red';
  const statusText = isApproved ? 'CONFIRMED' : 'REJECTED/CANCELLED';
  
  let detailsText = '';
  if (isApproved) {
    detailsText = `<p>Your appointment has been confirmed! We look forward to seeing you at the branch.</p>`;
  } else {
    detailsText = `
      <p>Your appointment could not be confirmed.</p>
      ${reason ? `<p><span class="label">Reason:</span> ${reason}</p>` : ''}
    `;
  }

  const content = `
    <h2>Donation Appointment Update</h2>
    <p>Your appointment status: <span class="badge">${statusText}</span></p>
    <div class="card">
      <p><span class="label">Branch:</span> ${branch.name}</p>
      <p><span class="label">Date:</span> ${new Date(appointment.date).toLocaleDateString()}</p>
      <p><span class="label">Time:</span> ${appointment.slot || 'N/A'}</p>
    </div>
    ${detailsText}
  `;
  return wrapHtml('Appointment Status Update', content, theme);
};

// 6. Camp registration confirmation (Donor)
export const getCampRegistrationTemplate = (camp, donorName) => {
  const content = `
    <h2>Blood Donation Camp Registration Confirmed</h2>
    <p>Hello ${donorName},</p>
    <p>You have successfully registered for the upcoming blood donation camp! Join the crew, save lives, and claim your ninja scroll!</p>
    <div class="card">
      <p><span class="label">Camp Name:</span> ${camp.name}</p>
      <p><span class="label">Date:</span> ${new Date(camp.date).toLocaleDateString()}</p>
      <p><span class="label">Time:</span> ${camp.startTime} - ${camp.endTime}</p>
      <p><span class="label">Location:</span> ${camp.address.street}, ${camp.address.city}, ${camp.address.state} - ${camp.address.pincode}</p>
      <p><span class="label">Organizer:</span> ${camp.organizer}</p>
    </div>
    <p>Thank you for contributing to society. Your effort matters!</p>
  `;
  return wrapHtml('Camp Registration Confirmed', content, 'gold');
};

// 7. Camp scheduled notice (Donor / Staff Announcement)
export const getCampScheduledTemplate = (camp, branch) => {
  const content = `
    <h2>New Blood Donation Camp Scheduled!</h2>
    <p>A new camp has been scheduled in your region. Spread the word and bring your fellow warriors!</p>
    <div class="card">
      <p><span class="label">Camp Name:</span> ${camp.name}</p>
      <p><span class="label">Date:</span> ${new Date(camp.date).toLocaleDateString()}</p>
      <p><span class="label">Timing:</span> ${camp.startTime} - ${camp.endTime}</p>
      <p><span class="label">Address:</span> ${camp.address.street}, ${camp.address.city}, ${camp.address.state} - ${camp.address.pincode}</p>
      <p><span class="label">Associated Branch:</span> ${branch.name}</p>
    </div>
    <p>Join us to make this camp a success!</p>
  `;
  return wrapHtml('New Camp Scheduled Announcement', content, 'orange');
};

// 8. Camp cancellation notice (Donor / Staff)
export const getCampCancelledTemplate = (camp, reason = 'Unforeseen circumstances') => {
  const content = `
    <h2>Blood Donation Camp Cancelled</h2>
    <p>We regret to inform you that the following blood donation camp has been cancelled:</p>
    <div class="card">
      <p><span class="label">Camp Name:</span> ${camp.name}</p>
      <p><span class="label">Scheduled Date:</span> ${new Date(camp.date).toLocaleDateString()}</p>
      <p><span class="label">Reason for Cancellation:</span> ${reason}</p>
    </div>
    <p>We apologize for the inconvenience and hope to schedule another camp soon. Thank you for your support.</p>
  `;
  return wrapHtml('Camp Cancellation Notice', content, 'red');
};

// 9. Donation completion certificate & thank you (Donor)
export const getDonationCompletionTemplate = (donation, donorName) => {
  const content = `
    <h2>Thank You for Your Donation! 🛡️</h2>
    <p>Dear ${donorName},</p>
    <p>You successfully completed a blood donation! Your bravery is commendable. Your blood is now stored in our reserves, waiting to be sent to someone in need.</p>
    <div class="card">
      <p><span class="label">Donation ID:</span> ${donation.donationId || 'N/A'}</p>
      <p><span class="label">Blood Group:</span> ${donation.bloodGroup}</p>
      <p><span class="label">Volume Donated:</span> ${donation.volume || 350} ml</p>
      <p><span class="label">Date:</span> ${new Date(donation.createdAt || Date.now()).toLocaleDateString()}</p>
    </div>
    <p>Your contribution makes you a certified hero of the Crimson Code. Keep shining!</p>
  `;
  return wrapHtml('Blood Donation Complete - Thank You', content, 'gold');
};

// 10. Blood request created (Hospital/Patient)
export const getBloodRequestCreatedTemplate = (request) => {
  const content = `
    <h2>Blood Request Submitted</h2>
    <p>Your blood request has been successfully submitted and is under review.</p>
    <div class="card">
      <p><span class="label">Request ID:</span> ${request.requestId || 'N/A'}</p>
      <p><span class="label">Patient Name:</span> ${request.patientName}</p>
      <p><span class="label">Blood Group:</span> ${request.bloodGroup}</p>
      <p><span class="label">Units Requested:</span> ${request.units}</p>
      <p><span class="label">Urgency Level:</span> <span class="badge">${request.urgency}</span></p>
    </div>
    <p>We will notify you immediately once a branch approves your request and allocates stock.</p>
  `;
  return wrapHtml('Blood Request Received', content, 'orange');
};

// 11. Blood request approval/rejection (Hospital/Patient)
export const getBloodRequestStatusTemplate = (request, status, reason = '') => {
  const isApproved = status === 'approved';
  const theme = isApproved ? 'green' : 'red';
  const statusText = isApproved ? 'APPROVED' : 'REJECTED';
  
  let detailsText = '';
  if (isApproved) {
    detailsText = `<p>Your request has been approved! Please visit the branch or coordinate with them to collect the blood units.</p>`;
  } else {
    detailsText = `
      <p>We are sorry to inform you that your blood request was rejected.</p>
      ${reason ? `<p><span class="label">Reason:</span> ${reason}</p>` : ''}
    `;
  }

  const content = `
    <h2>Blood Request Status Update</h2>
    <p>Status: <span class="badge">${statusText}</span></p>
    <div class="card">
      <p><span class="label">Patient:</span> ${request.patientName}</p>
      <p><span class="label">Blood Group:</span> ${request.bloodGroup}</p>
      <p><span class="label">Units:</span> ${request.units}</p>
    </div>
    ${detailsText}
  `;
  return wrapHtml('Blood Request Status', content, theme);
};

// 12. Low stock alert (Admin/Branch Admin)
export const getLowStockAlertTemplate = (branch, bloodType, units) => {
  const content = `
    <h2>⚠️ LOW BLOOD STOCK ALERT</h2>
    <p>The blood stock at <span class="label">${branch.name}</span> has fallen below critical thresholds!</p>
    <div class="card">
      <p><span class="label">Branch Name:</span> ${branch.name}</p>
      <p><span class="label">Blood Type:</span> <strong>${bloodType}</strong></p>
      <p><span class="label">Current Units:</span> <strong style="color:#e5383b;">${units} units</strong></p>
    </div>
    <p>Please schedule a blood donation camp or coordinate transfers immediately to avoid supply outages.</p>
  `;
  return wrapHtml('Low Stock Alert', content, 'orange');
};

// 13. Password reset (User)
export const getPasswordResetTemplate = (user, resetUrl) => {
  const content = `
    <h2>Reset Your Password</h2>
    <p>Hello ${user.name || 'User'},</p>
    <p>You requested a password reset for your account. Click the button below to set a new password. This link is valid for 1 hour.</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
    </div>
    <p>If you did not request this, please ignore this email; your password will remain unchanged.</p>
  `;
  return wrapHtml('Password Reset Request', content, 'red');
};

// 14. Emergency blood request alert (Nearby donors)
export const getEmergencyBloodRequestTemplate = (request, distanceText, branch) => {
  const content = `
    <h2 style="color:#e5383b; text-shadow:0 0 10px rgba(229,56,59,0.8);">🚨 EMERGENCY BLOOD DONATION REQUIRED!</h2>
    <p>Hello Warrior,</p>
    <p>An emergency request for <strong style="font-size:20px; color:#e5383b;">${request.bloodGroup}</strong> blood has been raised at a branch near you (${distanceText})!</p>
    <div class="card" style="border-left-color:#e5383b; background-color:#1e0d0f;">
      <p><span class="label">Required Blood Group:</span> <strong>${request.bloodGroup}</strong></p>
      <p><span class="label">Requested Units:</span> ${request.units}</p>
      <p><span class="label">Hospital/Branch Name:</span> ${branch.name}</p>
      <p><span class="label">Address:</span> ${branch.address.street}, ${branch.address.city}, ${branch.address.state} - ${branch.address.pincode}</p>
      <p><span class="label">Branch Phone:</span> ${branch.phone}</p>
    </div>
    <p>If you are eligible to donate, please proceed to the branch or contact them immediately. A life is in your hands!</p>
  `;
  return wrapHtml('EMERGENCY: Blood Donor Needed Nearby!', content, 'red');
};
