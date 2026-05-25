import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import Hospital from '../models/Hospital.js';
import BloodInventory from '../models/BloodInventory.js';
import Branch from '../models/Branch.js';
import Staff from '../models/Staff.js';

dotenv.config();

// ─── Color helpers for terminal output ───────────────────────────────────────
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
};

const log = {
  info:    (msg) => console.log(`  ${c.cyan('ℹ')}  ${msg}`),
  success: (msg) => console.log(`  ${c.green('✓')}  ${msg}`),
  warn:    (msg) => console.log(`  ${c.yellow('⚠')}  ${msg}`),
  error:   (msg) => console.log(`  ${c.red('✗')}  ${msg}`),
  section: (msg) => console.log(`\n${c.bold(c.cyan(`── ${msg} `))}${'─'.repeat(Math.max(0, 46 - msg.length))}`),
  table:   (rows) => {
    const width = Math.max(...rows.map(r => r[0].length)) + 2;
    rows.forEach(([k, v]) => console.log(`  ${c.dim(k.padEnd(width))} ${c.green(v)}`));
  },
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ─── Check for --destroy flag ─────────────────────────────────────────────────
const DESTROY = process.argv.includes('--destroy');

const seedDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    log.error('MONGO_URI is not set. Aborting.');
    process.exit(1);
  }

  console.log(c.bold('\n🩸 BBMS Database Seeder v2.0\n'));

  try {
    log.info(`Connecting to MongoDB...`);
    await mongoose.connect(uri);
    log.success(`Connected: ${c.dim(uri.replace(/:\/\/.*@/, '://***@'))}`);

    // ── Destroy mode ───────────────────────────────────────────────────────────
    if (DESTROY) {
      log.section('DESTROY MODE — clearing all collections');
      const models = [User, Donor, Hospital, BloodInventory, Branch, Staff];
      for (const Model of models) {
        const { deletedCount } = await Model.deleteMany({});
        log.warn(`Cleared ${Model.modelName}: ${deletedCount} documents deleted`);
      }
      log.success('All collections cleared.\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    // ── Safety check — don't overwrite existing data without --destroy ─────────
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      log.warn(`Database already has ${existingUsers} users.`);
      log.warn('Use --destroy flag to wipe and re-seed: node utils/seeder.js --destroy');
      log.warn('Then run the seeder again without --destroy.\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    // ─── Seed Branch ────────────────────────────────────────────────────────────
    log.section('Branch');
    const branch = await Branch.create({
      name: 'BBMS Central Branch',
      registrationNumber: 'BR-CENTRAL-001',
      branchId: 'CENTRAL-001',
      email: 'central@bbms.com',
      phone: '9000000001',
      address: {
        street: '1, Medical Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
      },
      latitude: 19.0760,
      longitude: 72.8777,
      status: 'approved',
      operatingHours: { open: '08:00', close: '20:00', daysOpen: ['Mon','Tue','Wed','Thu','Fri','Sat'] },
      storageCapacity: 500,
    });
    log.success(`Branch: ${branch.name} (${branch._id})`);

    // ─── Seed Users ─────────────────────────────────────────────────────────────
    log.section('Users');

    const admin = await User.create({
      name: 'Admin User',
      email: 'rdxraushan2005@gmail.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 9199948940',
      isEmailVerified: true,
    });
    log.success(`Admin  → rdxraushan2005@gmail.com`);

    const staffUser = await User.create({
      name: 'Lab Technician',
      email: 'staff@bbms.com',
      password: 'Staff@123',
      role: 'staff',
      phone: '8888888888',
      branchId: branch._id,
      staffRole: 'lab_staff',
      isEmailVerified: true,
    });
    log.success(`Staff  → staff@bbms.com`);

    // Create Staff record linked to staffUser
    await Staff.create({
      userId: staffUser._id,
      branchId: branch._id,
      fullName: 'Lab Technician',
      email: 'staff@bbms.com',
      phone: '8888888888',
      staffRole: 'lab_staff',
      staffId: 'STF-001',
      isActive: true,
    });

    const donorUser1 = await User.create({
      name: 'Raushan Kumar',
      email: 'donor@bbms.com',
      password: 'Donor@123',
      role: 'donor',
      phone: '7777777777',
      isEmailVerified: true,
    });
    await Donor.create({
      userId: donorUser1._id,
      fullName: 'Raushan Kumar',
      email: 'donor@bbms.com',
      phone: '7777777777',
      gender: 'male',
      bloodGroup: 'O+',
      dateOfBirth: new Date('1998-05-15'),
      weight: 70,
      isEligible: true,
    });
    log.success(`Donor  → donor@bbms.com     (O+)`);

    const donorUser2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@bbms.com',
      password: 'Donor@123',
      role: 'donor',
      phone: '6666666666',
      isEmailVerified: true,
    });
    await Donor.create({
      userId: donorUser2._id,
      fullName: 'Priya Sharma',
      email: 'priya@bbms.com',
      phone: '6666666666',
      gender: 'female',
      bloodGroup: 'A+',
      dateOfBirth: new Date('1995-08-20'),
      weight: 58,
      isEligible: true,
    });
    log.success(`Donor  → priya@bbms.com     (A+)`);

    const hospitalUser = await User.create({
      name: 'City Hospital',
      email: 'hospital@bbms.com',
      password: 'Hospital@123',
      role: 'hospital',
      phone: '5555555555',
      isEmailVerified: true,
    });
    await Hospital.create({
      userId: hospitalUser._id,
      name: 'City Hospital',
      email: 'hospital@bbms.com',
      phone: '5555555555',
      registrationNumber: 'HOS-001',
      type: 'government',
      isVerified: true,
    });
    log.success(`Hospital → hospital@bbms.com`);

    // ─── Seed Blood Inventory ───────────────────────────────────────────────────
    log.section('Blood Inventory');
    const inventoryRows = [];
    for (const bg of BLOOD_GROUPS) {
      const qty = Math.floor(Math.random() * 20) + 5;
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 42);
      await BloodInventory.create({
        bloodGroup: bg,
        quantity: qty,
        expiryDate: expiry,
        status: 'available',
        branchId: branch._id,
        collectionType: 'whole_blood',
      });
      inventoryRows.push([bg, `${qty} units`]);
    }
    log.table(inventoryRows);

    // ─── Summary ────────────────────────────────────────────────────────────────
    console.log(c.bold(c.green('\n✅ Database seeded successfully!\n')));
    console.log(c.bold('  Login credentials:'));
    log.table([
      ['rdxraushan2005@gmail.com',    'Admin@123'],
      ['staff@bbms.com',    'Staff@123'],
      ['donor@bbms.com',    'Donor@123'],
      ['priya@bbms.com',    'Donor@123'],
      ['hospital@bbms.com', 'Hospital@123'],
    ]);
    console.log();

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    log.error(`Seeding failed: ${error.message}`);
    if (process.env.NODE_ENV !== 'production') console.error(error.stack);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

seedDB();
