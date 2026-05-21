// ─────────────────────────────────────────────────────────────────────────────
// MongoDB Initialization Script
// Runs once when the MongoDB container is created for the first time.
// Creates the application user with readWrite access on the bloodbank database.
// ─────────────────────────────────────────────────────────────────────────────

// The root user (MONGO_INITDB_ROOT_USERNAME) is already created by Docker.
// We use it here to create a scoped app user.

db = db.getSiblingDB('bloodbank');

// Create dedicated app user with least-privilege access
db.createUser({
  user: 'bbms_app',
  pwd: process.env.MONGO_APP_PASSWORD || 'bbms_app_secret_2024',
  roles: [
    {
      role: 'readWrite',
      db: 'bloodbank',
    },
  ],
});

// Create admin user for local access with specified credentials
db.createUser({
  user: 'admin',
  pwd: 'bbms_app_secret_2024',
  roles: [
    {
      role: 'dbOwner',
      db: 'bloodbank',
    },
  ],
});

// Create initial indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.donors.createIndex({ bloodGroup: 1 });
db.bloodinventories.createIndex({ bloodGroup: 1, status: 1 });
db.bloodinventories.createIndex({ branchId: 1, bloodGroup: 1, status: 1 });
db.bloodinventories.createIndex({ expiryDate: 1 });
db.branches.createIndex({ location: '2dsphere' });
db.camps.createIndex({ location: '2dsphere' });
db.notifications.createIndex({ userId: 1, isRead: 1 });
db.notifications.createIndex({ createdAt: -1 });
db.auditlogs.createIndex({ createdAt: -1 });
db.inventorylogs.createIndex({ branchId: 1, createdAt: -1 });

print('✅ BBMS MongoDB initialization complete');
print('   - App user "bbms_app" created');
print('   - Indexes created on critical collections');
