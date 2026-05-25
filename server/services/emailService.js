import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import EmailLog from '../models/EmailLog.js';
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import Branch from '../models/Branch.js';
import {
  getBranchRegistrationTemplate,
  getBranchStatusTemplate,
  getStaffWelcomeTemplate,
  getAppointmentBookingTemplate,
  getAppointmentStatusTemplate,
  getCampRegistrationTemplate,
  getCampScheduledTemplate,
  getCampCancelledTemplate,
  getDonationCompletionTemplate,
  getBloodRequestCreatedTemplate,
  getBloodRequestStatusTemplate,
  getLowStockAlertTemplate,
  getPasswordResetTemplate,
  getEmergencyBloodRequestTemplate,
} from '../utils/emailTemplates.js';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Helper to asynchronously send email and log it
const sendEmail = async ({ to, subject, html, triggerAction }) => {
  // Create EmailLog entry first
  const emailLog = new EmailLog({
    recipient: to,
    subject,
    body: html,
    triggerAction,
    status: 'pending',
  });

  try {
    await emailLog.save();

    // Check if configuration is default placeholder
    if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('your_email')) {
      console.log(`[MOCK EMAIL SERVICE] Sending email to ${to}: ${subject}`);
      emailLog.status = 'sent';
      await emailLog.save();
      return { success: true, mock: true };
    }

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'BBMS'}" <${process.env.FROM_EMAIL || 'noreply@bbms.com'}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SERVICE] Email sent successfully to ${to}: ${info.messageId}`);

    emailLog.status = 'sent';
    await emailLog.save();
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL SERVICE ERROR] Failed to send email to ${to}:`, error);
    emailLog.status = 'failed';
    emailLog.errorMsg = error.message || 'Unknown error';
    await emailLog.save();
    return { success: false, error };
  }
};

// 1. Send Branch Registration Email (To Admin)
export const sendBranchRegistrationEmail = async (branch) => {
  try {
    // Find all system admin users
    const admins = await User.find({ role: 'admin', isActive: true });
    const adminEmails = admins.map((admin) => admin.email);

    if (adminEmails.length === 0) {
      // Fallback to configured from email
      adminEmails.push(process.env.FROM_EMAIL || 'admin@bbms.com');
    }

    const html = getBranchRegistrationTemplate(branch);
    for (const email of adminEmails) {
      await sendEmail({
        to: email,
        subject: `New Branch Registration: ${branch.name}`,
        html,
        triggerAction: 'branch_registration_request',
      });
    }
  } catch (error) {
    console.error('Error triggering branch registration email:', error);
  }
};

// 2. Send Branch Status Email (To Branch Manager / Email)
export const sendBranchStatusEmail = async (branch, status, reason = '') => {
  try {
    const html = getBranchStatusTemplate(branch, status, reason);
    await sendEmail({
      to: branch.email,
      subject: `Branch Registration Status: ${status.toUpperCase()}`,
      html,
      triggerAction: 'branch_status_update',
    });
  } catch (error) {
    console.error('Error triggering branch status email:', error);
  }
};

// 3. Send Staff Welcome Email (To Staff Member)
export const sendStaffWelcomeEmail = async (staff, password) => {
  try {
    const html = getStaffWelcomeTemplate(staff, password);
    await sendEmail({
      to: staff.email,
      subject: 'Welcome to the Crimson Code Staff Squad!',
      html,
      triggerAction: 'staff_welcome',
    });
  } catch (error) {
    console.error('Error triggering staff welcome email:', error);
  }
};

// 4. Send Appointment Booked Email (To Donor)
export const sendAppointmentBookedEmail = async (appointment, branch, donorEmail) => {
  try {
    const html = getAppointmentBookingTemplate(appointment, branch);
    await sendEmail({
      to: donorEmail,
      subject: 'Blood Donation Appointment Confirmed',
      html,
      triggerAction: 'appointment_booked',
    });
  } catch (error) {
    console.error('Error triggering appointment booked email:', error);
  }
};

// 5. Send Appointment Status Email (To Donor)
export const sendAppointmentStatusEmail = async (appointment, branch, status, reason = '', donorEmail) => {
  try {
    const html = getAppointmentStatusTemplate(appointment, branch, status, reason);
    await sendEmail({
      to: donorEmail,
      subject: `Blood Donation Appointment Update: ${status.toUpperCase()}`,
      html,
      triggerAction: 'appointment_status_update',
    });
  } catch (error) {
    console.error('Error triggering appointment status email:', error);
  }
};

// 6. Send Camp Registration Email (To Donor)
export const sendCampRegistrationEmail = async (camp, donorEmail, donorName) => {
  try {
    const html = getCampRegistrationTemplate(camp, donorName);
    await sendEmail({
      to: donorEmail,
      subject: `Registration Confirmed for ${camp.name}`,
      html,
      triggerAction: 'camp_registration',
    });
  } catch (error) {
    console.error('Error triggering camp registration email:', error);
  }
};

// 7. Send Camp Scheduled Email (Broadcast to Donors)
export const sendCampScheduledEmail = async (camp, branch) => {
  try {
    // Find all donors in the same city to broadcast the camp
    const city = camp.address?.city;
    let query = { role: 'donor', isActive: true };
    
    // Fetch user IDs of donors in that city
    const donorUsers = await User.find(query);
    const donorEmails = donorUsers.map(user => user.email);

    if (donorEmails.length === 0) return;

    const html = getCampScheduledTemplate(camp, branch);
    for (const email of donorEmails) {
      await sendEmail({
        to: email,
        subject: `New Blood Donation Camp Scheduled: ${camp.name}`,
        html,
        triggerAction: 'camp_scheduled',
      });
    }
  } catch (error) {
    console.error('Error triggering camp scheduled email:', error);
  }
};

// 8. Send Camp Cancelled Email (To Registered Donors)
export const sendCampCancelledEmail = async (camp, reason, registeredEmails) => {
  try {
    const html = getCampCancelledTemplate(camp, reason);
    for (const email of registeredEmails) {
      await sendEmail({
        to: email,
        subject: `IMPORTANT: Blood Donation Camp Cancelled - ${camp.name}`,
        html,
        triggerAction: 'camp_cancelled',
      });
    }
  } catch (error) {
    console.error('Error triggering camp cancelled email:', error);
  }
};

// 9. Send Donation Completion Email (To Donor)
export const sendDonationCompletionEmail = async (donation, donorName, donorEmail) => {
  try {
    const html = getDonationCompletionTemplate(donation, donorName);
    await sendEmail({
      to: donorEmail,
      subject: 'Thank You for Your Donation! Certification Logged',
      html,
      triggerAction: 'donation_completion',
    });
  } catch (error) {
    console.error('Error triggering donation completion email:', error);
  }
};

// 10. Send Blood Request Created Email (To Requester)
export const sendBloodRequestCreatedEmail = async (request, requesterEmail) => {
  try {
    const html = getBloodRequestCreatedTemplate(request);
    await sendEmail({
      to: requesterEmail,
      subject: `Blood Request Submitted: ${request.requestId || 'Confirmation'}`,
      html,
      triggerAction: 'blood_request_created',
    });
  } catch (error) {
    console.error('Error triggering blood request created email:', error);
  }
};

// 11. Send Blood Request Status Email (To Requester)
export const sendBloodRequestStatusEmail = async (request, status, reason = '', requesterEmail) => {
  try {
    const html = getBloodRequestStatusTemplate(request, status, reason);
    await sendEmail({
      to: requesterEmail,
      subject: `Blood Request Update: ${status.toUpperCase()}`,
      html,
      triggerAction: 'blood_request_status_update',
    });
  } catch (error) {
    console.error('Error triggering blood request status email:', error);
  }
};

// 12. Send Low Stock Alert Email (To Admins & Branch Manager)
export const sendLowStockAlertEmail = async (branch, bloodType, units) => {
  try {
    const recipients = [];
    
    // Find all system admin users
    const admins = await User.find({ role: 'admin', isActive: true });
    admins.forEach((admin) => recipients.push(admin.email));

    // Find the branch manager if exists
    if (branch.managerId) {
      const manager = await User.findById(branch.managerId);
      if (manager && manager.email && !recipients.includes(manager.email)) {
        recipients.push(manager.email);
      }
    }

    if (recipients.length === 0) {
      recipients.push(process.env.FROM_EMAIL || 'admin@bbms.com');
    }

    const html = getLowStockAlertTemplate(branch, bloodType, units);
    for (const email of recipients) {
      await sendEmail({
        to: email,
        subject: `🚨 CRITICAL: Low Blood Stock Alert (${bloodType}) at ${branch.name}`,
        html,
        triggerAction: 'low_stock_alert',
      });
    }
  } catch (error) {
    console.error('Error triggering low stock alert email:', error);
  }
};

// 13. Send Password Reset Email (To User)
export const sendPasswordResetEmail = async (user, resetUrl) => {
  try {
    const html = getPasswordResetTemplate(user, resetUrl);
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Crimson Code',
      html,
      triggerAction: 'password_reset',
    });
  } catch (error) {
    console.error('Error triggering password reset email:', error);
  }
};

// 14. Send Emergency Blood Request Email (To Nearby Donors)
export const sendEmergencyBloodRequestEmail = async (request, branch) => {
  try {
    // Locate active eligible donors matching the requested blood group in the branch's city
    const donorProfiles = await Donor.find({
      bloodGroup: request.bloodGroup,
      status: 'active',
      isEligible: true,
      'address.city': { $regex: new RegExp(branch.address.city, 'i') },
    }).populate('userId');

    const recipients = donorProfiles
      .map((d) => d.userId?.email || d.email)
      .filter((email) => !!email);

    if (recipients.length === 0) {
      console.log(`[EMERGENCY EMAIL] No nearby active eligible donors found for ${request.bloodGroup} in ${branch.address.city}`);
      return;
    }

    const distanceText = 'Within your city';
    const html = getEmergencyBloodRequestTemplate(request, distanceText, branch);

    for (const email of recipients) {
      await sendEmail({
        to: email,
        subject: `🚨 EMERGENCY: ${request.bloodGroup} Blood Donation Needed Near You!`,
        html,
        triggerAction: 'emergency_blood_request',
      });
    }
  } catch (error) {
    console.error('Error triggering emergency blood request email:', error);
  }
};

// Retry failed emails scheduler (attempts up to 3 times)
export const retryFailedEmailsJob = async () => {
  console.log('[EMAIL JOB] Running scheduled retry job for failed emails...');
  try {
    const failedEmails = await EmailLog.find({ status: 'failed', retryAttempts: { $lt: 3 } });
    console.log(`[EMAIL JOB] Found ${failedEmails.length} failed emails to retry.`);
    
    for (const emailLog of failedEmails) {
      emailLog.retryAttempts += 1;
      
      try {
        if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('your_email')) {
          emailLog.status = 'sent';
          await emailLog.save();
          continue;
        }

        const mailOptions = {
          from: `"${process.env.FROM_NAME || 'BBMS'}" <${process.env.FROM_EMAIL || 'noreply@bbms.com'}>`,
          to: emailLog.recipient,
          subject: emailLog.subject,
          html: emailLog.body,
        };

        await transporter.sendMail(mailOptions);
        emailLog.status = 'sent';
        console.log(`[EMAIL JOB] Retry succeeded for log ${emailLog.logId}`);
      } catch (error) {
        emailLog.errorMsg = error.message || 'Retry failed';
        console.error(`[EMAIL JOB ERROR] Retry ${emailLog.retryAttempts} failed for log ${emailLog.logId}:`, error.message);
      }
      
      await emailLog.save();
    }
  } catch (error) {
    console.error('[EMAIL JOB ERROR] Failed during retry execution:', error);
  }
};

// Send OTP email helper for 2FA
export const sendOtpEmail = async (to, otp, name) => {
  const html = `
    <div style="font-family: 'Space Grotesk', Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #333; border-radius: 12px; background-color: #0f0f15; color: #f1f1f7; box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);">
      <h2 style="color: #ef4444; text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 10px; margin-top: 0; font-weight: 800;">🩸 BBMS 2FA VERIFICATION CODE 🩸</h2>
      <p style="font-size: 16px; line-height: 1.6;">Hello ${name || 'User'},</p>
      <p style="font-size: 15px; line-height: 1.6; color: #a1a1aa;">A login attempt was initiated for your BBMS account. Use the following One-Time Password (OTP) code to complete your verification session:</p>
      <div style="background: #181825; padding: 20px; text-align: center; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #ef4444; margin: 30px 0; border-radius: 8px; border: 2px dashed #ef4444; font-family: monospace;">
        ${otp}
      </div>
      <p style="font-size: 14px; color: #e4e4e7; text-align: center; font-weight: bold;">This code is valid for exactly 5 minutes.</p>
      <p style="color: #71717a; font-size: 12px; text-align: center; border-top: 1px solid #27272a; padding-top: 15px; margin-top: 30px;">If you did not request this verification, please secure your account credentials immediately.</p>
    </div>
  `;
  await sendEmail({
    to,
    subject: `Your BBMS 2FA Verification Code: ${otp}`,
    html,
    triggerAction: 'otp_verification',
  });
};

