import dotenv from 'dotenv';
import mongoose from 'mongoose';
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
} from './emailTemplates.js';

dotenv.config();

// Create sample mock objects for all templates
const sampleBranch = {
  name: 'Leaf Village Blood Reserve',
  registrationNumber: 'LV-98765-SHINOBI',
  email: 'naruto@leafvillage.gov',
  phone: '+91 99999 88888',
  address: {
    street: '1 Hokage Rock Blvd',
    city: 'Konohagakure',
    state: 'Land of Fire',
    pincode: '123456'
  },
  operatingHours: { open: '08:00', close: '20:00' }
};

const sampleStaff = {
  name: 'Kakashi Hatake',
  email: 'kakashi@copy-ninja.com',
  role: 'staff'
};

const sampleAppointment = {
  appointmentId: 'APT-4242',
  date: new Date(),
  slot: '10:00 AM - 11:00 AM',
  bloodGroup: 'O+',
  status: 'approved'
};

const sampleCamp = {
  name: 'Grand Line Blood Crusade',
  date: new Date(),
  startTime: '09:00 AM',
  endTime: '04:00 PM',
  address: {
    street: 'Foosha Village Dock 1',
    city: 'East Blue',
    state: 'Grand Line',
    pincode: '456789'
  }
};

const sampleRequest = {
  requestId: 'REQ-9999',
  patientName: 'Monkey D. Luffy',
  bloodGroup: 'A+',
  unitsRequired: 5,
  urgency: 'emergency',
  hospitalName: 'Marineford Hospital',
  address: {
    street: 'Plaza Center',
    city: 'New World',
    state: 'Grand Line'
  }
};

const sampleUser = {
  name: 'Sasuke Uchiha',
  email: 'sasuke@uchiha.org'
};

console.log('--- Testing HTML Template Generation ---');

try {
  const t1 = getBranchRegistrationTemplate(sampleBranch);
  const t2 = getBranchStatusTemplate(sampleBranch, 'approved', 'Meets all Konoha sanitary codes');
  const t3 = getStaffWelcomeTemplate(sampleStaff, 'Chidori123!');
  const t4 = getAppointmentBookingTemplate(sampleAppointment, sampleBranch);
  const t5 = getAppointmentStatusTemplate(sampleAppointment, sampleBranch, 'approved', 'Donation room prepared');
  const t6 = getCampRegistrationTemplate(sampleCamp, 'Luffy');
  const t7 = getCampScheduledTemplate(sampleCamp, sampleBranch);
  const t8 = getCampCancelledTemplate(sampleCamp, 'Severe storm from Grand Line');
  const t9 = getDonationCompletionTemplate(sampleAppointment, 'Zoro');
  const t10 = getBloodRequestCreatedTemplate(sampleRequest);
  const t11 = getBloodRequestStatusTemplate(sampleRequest, 'approved', 'Sufficient inventory match');
  const t12 = getLowStockAlertTemplate(sampleBranch, 'B-', 2);
  const t13 = getPasswordResetTemplate(sampleUser, 'http://localhost:5173/reset/mock-token');
  const t14 = getEmergencyBloodRequestTemplate(sampleRequest, 'Within 5 km', sampleBranch);

  console.log('✅ Successfully generated all 14 email templates!');
  console.log(`Branch Registration Template length: ${t1.length} chars`);
  console.log(`Branch Status Template length: ${t2.length} chars`);
  console.log(`Staff Welcome Template length: ${t3.length} chars`);
  console.log(`Appointment Booking Template length: ${t4.length} chars`);
  console.log(`Appointment Status Template length: ${t5.length} chars`);
  console.log(`Camp Registration Template length: ${t6.length} chars`);
  console.log(`Camp Scheduled Template length: ${t7.length} chars`);
  console.log(`Camp Cancelled Template length: ${t8.length} chars`);
  console.log(`Donation Completion Template length: ${t9.length} chars`);
  console.log(`Blood Request Created Template length: ${t10.length} chars`);
  console.log(`Blood Request Status Template length: ${t11.length} chars`);
  console.log(`Low Stock Alert Template length: ${t12.length} chars`);
  console.log(`Password Reset Template length: ${t13.length} chars`);
  console.log(`Emergency Blood Request Template length: ${t14.length} chars`);
  
  console.log('--- Test Completed Successfully ---');
  process.exit(0);
} catch (error) {
  console.error('❌ Template compilation failed:', error);
  process.exit(1);
}
