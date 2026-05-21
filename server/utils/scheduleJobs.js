import cron from 'node-cron';
import BloodInventory from '../models/BloodInventory.js';
import InventoryLog from '../models/InventoryLog.js';
import Donor from '../models/Donor.js';
import NotificationService from '../services/notificationService.js';
import { emitLowStockAlert } from './socketManager.js';

/**
 * Runs all scheduled background jobs.
 * Call this once from server.js after Socket.IO is initialized.
 */
export const startScheduledJobs = () => {
  console.log('⏰ Starting scheduled jobs...');

  // ─── 1. Auto-expire blood units — runs every day at 00:05 ──────────────────
  cron.schedule('5 0 * * *', async () => {
    console.log('[CRON] Running blood expiry check...');
    try {
      const now = new Date();
      const expiredItems = await BloodInventory.find({
        expiryDate: { $lt: now },
        status: { $in: ['available', 'reserved'] },
      });

      if (expiredItems.length === 0) return;

      for (const item of expiredItems) {
        const prevQty = item.quantity;
        item.status = 'expired';
        await item.save();

        // Log the expiry
        await InventoryLog.create({
          operationType: 'expiry',
          bloodGroup: item.bloodGroup,
          component: item.component,
          quantity: item.quantity,
          previousQuantity: prevQty,
          updatedQuantity: 0,
          branchId: item.branchId,
          inventoryItemId: item._id,
          reason: 'Automatic expiry check',
          referenceType: 'Manual',
        });
      }

      console.log(`[CRON] Marked ${expiredItems.length} blood units as expired`);
    } catch (err) {
      console.error('[CRON] Expiry check error:', err.message);
    }
  });

  // ─── 2. Low stock alert — runs every 6 hours ───────────────────────────────
  cron.schedule('0 */6 * * *', async () => {
    console.log('[CRON] Running low stock check...');
    try {
      const LOW_STOCK_THRESHOLD = 5;

      const stockSummary = await BloodInventory.aggregate([
        { $match: { status: 'available' } },
        {
          $group: {
            _id: { bloodGroup: '$bloodGroup', branchId: '$branchId' },
            totalUnits: { $sum: '$quantity' },
          },
        },
        { $match: { totalUnits: { $lte: LOW_STOCK_THRESHOLD } } },
      ]);

      for (const item of stockSummary) {
        const { bloodGroup, branchId } = item._id;
        const quantity = item.totalUnits;

        // Emit real-time alert
        emitLowStockAlert(branchId?.toString(), bloodGroup, quantity);

        // Create notification for all admins
        await NotificationService.notifyAdminsLowStock(bloodGroup, quantity, branchId);

        console.log(`[CRON] Low stock alert: ${bloodGroup} = ${quantity} units (branch: ${branchId || 'main'})`);
      }
    } catch (err) {
      console.error('[CRON] Low stock check error:', err.message);
    }
  });

  // ─── 3. Donor eligibility status update — runs every day at 01:00 ──────────
  cron.schedule('0 1 * * *', async () => {
    console.log('[CRON] Updating donor eligibility statuses...');
    try {
      const now = new Date();

      // Find donors in cooling period who are now eligible (whole blood - 90 days)
      const wholeBloodEligible = await Donor.find({
        eligibilityStatus: 'cooling_period',
        lastDonationDate: { $lt: new Date(now - 90 * 24 * 60 * 60 * 1000) },
      });

      for (const donor of wholeBloodEligible) {
        const check = donor.checkEligibility('whole_blood');
        if (check.eligible) {
          donor.eligibilityStatus = 'eligible';
          donor.isEligible = true;
          await donor.save();
        }
      }

      console.log(`[CRON] Updated eligibility for ${wholeBloodEligible.length} donors`);
    } catch (err) {
      console.error('[CRON] Eligibility update error:', err.message);
    }
  });

  console.log('✅ Scheduled jobs initialized');
};
