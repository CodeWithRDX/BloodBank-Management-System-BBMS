```md id="lj1g1w"
# Revised Requirements Document
# Blood Bank Management System (BBMS)
## Advanced MERN Stack Web Application Requirements

---

# 1. Project Overview

The Blood Bank Management System (BBMS) is a centralized MERN stack platform designed to automate and manage blood donation services, blood inventory, donor management, blood bank branches, camps, staff operations, emergency blood requests, and real-time blood tracking.

The system will support:
- Multiple blood bank branches
- Staff management
- Automated inventory synchronization
- Donation camp management
- Geo-location based blood requests
- Real-time transaction logs
- Donor eligibility tracking
- Automated notifications

---

# 2. Core Objectives

The system should:

- Automate blood inventory updates
- Synchronize stock across branches
- Manage blood donation camps
- Track donor eligibility and cooling periods
- Allow location-based blood requests
- Maintain complete transaction logs
- Support admin approval workflows
- Provide branch and staff management
- Improve emergency blood access

---

# 3. User Roles

---

# A. Super Admin

The Super Admin controls the entire platform.

## Permissions
- Approve/reject new blood bank branches
- Add/manage branches
- Add/manage staff
- Monitor all logs
- Monitor inventory across all branches
- View all donations and requests
- Manage camps
- Suspend users/branches
- View analytics and reports

---

# B. Branch Admin

Each branch can have a branch admin.

## Permissions
- Manage local inventory
- Approve local requests
- Manage branch staff
- View branch logs
- Manage donation camps

---

# C. Staff

Staff members manage operational activities.

## Permissions
- Create blood donation camps
- Add blood donations
- Update inventory
- Issue blood units
- Verify donor details
- Manage camp registrations
- View assigned branch data

---

# D. Donor

## Permissions
- Register/Login
- Register for camps
- Donate blood
- View donation history
- Check donation eligibility
- Raise emergency requests
- Locate nearby blood banks

---

# E. Blood Request Receiver / Patient

## Permissions
- Search nearby blood banks
- Raise blood requests
- Track request status
- View availability

---

# 4. Multi-Branch Management System

---

# Branch Registration Workflow

## New Feature

Any new blood bank branch can sign up on the platform.

## Flow
1. Branch submits registration request
2. Status remains:
   - Pending Approval
3. Admin reviews request
4. Admin approves/rejects branch
5. Only approved branches can operate

---

# Branch Information

## Required Fields
- Branch Name
- Registration Number
- Address
- City
- State
- Country
- Latitude
- Longitude
- Contact Email
- Phone Number
- License Documents

---

# Branch Status
- Pending
- Approved
- Rejected
- Suspended

---

# 5. Automated Inventory Synchronization

---

# Real-Time Inventory Automation

The inventory system must update automatically whenever:

- Blood donation occurs
- Blood is issued
- Blood expires
- Blood is transferred
- Blood is discarded

---

# Automated Inventory Operations

## Addition
When blood is donated:
- Inventory increases automatically

## Subtraction
When blood is issued:
- Inventory decreases automatically

## Expiry Handling
Expired blood units:
- Automatically marked unavailable
- Removed from usable inventory

---

# Real-Time Sync Requirements

Inventory changes should:
- Sync instantly across dashboards
- Update all branch records
- Reflect in admin analytics
- Trigger alerts if stock becomes low

---

# Inventory Logs

Every inventory operation must generate logs.

## Log Information
- Operation Type
- Blood Group
- Quantity
- Branch
- Performed By
- Timestamp
- Previous Quantity
- Updated Quantity
- Reason

---

# 6. Blood Donation Camp Management

---

# Staff Camp Creation

Staff members should be able to:
- Create new donation camps
- Edit camps
- Cancel camps
- Manage registrations

---

# Camp Details

## Required Fields
- Camp Name
- Organizer
- Date
- Time
- Address
- Coordinates
- Maximum Donors
- Branch Association

---

# Camp Registration Automation

When a donor registers for a camp:

## Notifications must go to:
1. Admin
2. Associated Branch
3. Assigned Staff
4. Camp Dashboard

---

# Camp Dashboard Features

- Total registrations
- Eligible donors
- Donation count
- Camp inventory contribution
- Attendance tracking

---

# 7. Donor Cooling Period System

---

# Eligibility Rules

A donor cannot donate again until the cooling period is completed.

---

# Cooling Period Rules

## Whole Blood Donation
- Minimum gap: 90 days

## Platelet Donation
- Minimum gap: 14 days

---

# Automated Eligibility Check

Before booking:
- System checks last donation date
- Rejects ineligible requests
- Shows remaining cooldown time

---

# Donor Status
- Eligible
- Cooling Period Active
- Temporarily Blocked
- Permanently Restricted

---

# 8. Blood Request System

---

# Geo-Location Based Blood Requests

Users should be able to:
- Search nearby blood banks
- Request blood from nearest branches
- View available blood stock

---

# Location Features

Use:
- Google Maps API
- OpenStreetMap API

---

# Features

## Nearby Blood Banks
- Show nearest branches
- Distance calculation
- Available blood groups

## Emergency Request
- Raise emergency blood request
- Notify nearby branches
- Notify admins

---

# Request Workflow

1. User raises request
2. Nearby branches notified
3. Branch approves/rejects
4. Inventory auto-updates on approval

---

# Request Status
- Pending
- Accepted
- Rejected
- Fulfilled
- Cancelled

---

# 9. Blood Bank Locator Feature

---

# Interactive Map System

Users can:
- Locate all blood banks
- View nearby camps
- Filter by blood group
- View live availability

---

# Map Features

## Filters
- Blood group
- Distance
- Availability
- Branch status

---

# Branch Information on Map

- Branch Name
- Address
- Contact
- Available Blood
- Operating Hours

---

# 10. Staff Management System

---

# Admin Features

Admin can:
- Add staff
- Remove staff
- Assign branch
- Assign roles
- Monitor activities

---

# Staff Information

## Required Fields
- Full Name
- Email
- Phone
- Role
- Branch ID
- Employee ID

---

# Staff Roles
- Inventory Staff
- Camp Staff
- Lab Staff
- Branch Manager

---

# 11. Transaction Logging System

---

# Complete Audit Logs

Every action in the system must be logged.

---

# Log Categories

## Inventory Logs
- Stock addition
- Stock removal
- Expiry updates

## Donation Logs
- Donor registration
- Blood collection

## Request Logs
- Blood request creation
- Approval/rejection

## Staff Logs
- Staff login
- Camp creation
- Inventory operations

---

# Log Information

## Required Fields
- Action Type
- User
- Branch
- Timestamp
- Old Data
- New Data
- IP Address
- Device Information

---

# 12. Notification System

---

# Real-Time Notifications

Notifications should be sent for:
- Camp registrations
- Emergency requests
- Low stock alerts
- Approval requests
- Donation reminders
- Request approvals

---

# Notification Channels

- Email
- SMS
- In-App Notifications

---

# 13. Real-Time Features

---

# Use Socket.IO

Real-time updates for:
- Inventory changes
- Blood requests
- Notifications
- Camp registrations
- Dashboard updates

---

# 14. Advanced Inventory System

---

# Blood Components

Track separately:
- Whole Blood
- Plasma
- Platelets
- RBC
- WBC

---

# Expiry Tracking

System should:
- Track expiry dates
- Send expiry alerts
- Auto-remove expired units

---

# Transfer System

Branches should:
- Transfer blood units
- Track transfer logs
- Maintain transfer history

---

# 15. Reports & Analytics

---

# Admin Reports

## Reports
- Branch performance
- Donation statistics
- Blood usage
- Request fulfillment
- Camp analytics
- Staff performance

---

# Graphs & Charts

Use:
- Recharts
- Chart.js

---

# 16. Security Requirements

---

# Mandatory Security

- JWT Authentication
- Role-Based Access
- Helmet
- Rate Limiting
- XSS Protection
- Mongo Sanitization
- Secure Password Hashing
- Activity Monitoring

---

# 17. Technical Requirements

---

# Frontend
- React.js
- Redux Toolkit
- Tailwind CSS
- Axios
- React Router

---

# Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO

---

# APIs
- REST APIs
- Geo-location APIs
- Maps APIs

---

# 18. Database Requirements

---

# New Required Collections

- Branches
- InventoryLogs
- TransactionLogs
- Notifications
- Camps
- CampRegistrations
- BloodTransfers

---

# 19. Automation Requirements

---

# Automated Workflows

## Inventory Automation
- Auto stock updates

## Donor Automation
- Auto eligibility checks

## Camp Automation
- Auto registration notifications

## Request Automation
- Auto nearest branch detection

## Alert Automation
- Auto low-stock alerts

---

# 20. Deployment Requirements

---

# Docker Support

Generate:
- Dockerfile
- docker-compose.yml

---

# Cloud Deployment

Support:
- AWS
- Railway
- Render
- MongoDB Atlas

---

# 21. Final Expected Features

The final system must support:

- Multi-branch management
- Real-time inventory synchronization
- Automated blood tracking
- Donation camp management
- Geo-location blood requests
- Live notifications
- Complete transaction logging
- Admin approval workflows
- Staff management
- Real-time dashboards
- Emergency response system

---

# 22. Expected Outcome

The system should function as a complete enterprise-level Blood Bank Management platform with:
- Automation
- Real-time synchronization
- Multi-branch support
- Security
- Scalability
- Geo-location services
- Real-time analytics

---
```
