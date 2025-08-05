const mongoose = require('mongoose');
const Timer = require('../models/timerModel');

// Migration script to add duration field to existing timer entries
async function migrateTimerDuration() {
  try {
    console.log('Starting timer duration migration...');
    
    // Connect to MongoDB (you may need to adjust the connection string)
    if (!mongoose.connection.readyState) {
      await mongoose.connect("mongodb+srv://hardikparikh19:Gixuhel%402004@cluster0.ecasczy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" || 'mongodb://localhost:27017/project_management');
    }

    // Find all timers that don't have a duration field or have duration = 0
    const timersToUpdate = await Timer.find({
      $or: [
        { duration: { $exists: false } },
        { duration: 0 }
      ],
      endTime: { $exists: true, $ne: null },
      startTime: { $exists: true, $ne: null }
    });

    console.log(`Found ${timersToUpdate.length} timers to migrate`);

    let updated = 0;
    let skipped = 0;

    for (const timer of timersToUpdate) {
      try {
        if (timer.endTime && timer.startTime) {
          const totalTime = timer.endTime.getTime() - timer.startTime.getTime();
          const pausedTime = timer.totalPausedTime || 0;
          const durationInMinutes = Math.round((totalTime - pausedTime) / 60000);

          await Timer.updateOne(
            { _id: timer._id },
            {
              $set: {
                duration: durationInMinutes,
                isPaused: false,
                totalPausedTime: pausedTime,
                pausedAt: null
              }
            }
          );
          
          updated++;
          
          if (updated % 100 === 0) {
            console.log(`Migrated ${updated} timers...`);
          }
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Error updating timer ${timer._id}:`, error);
        skipped++;
      }
    }

    console.log('Migration completed!');
    console.log(`- Updated: ${updated} timers`);
    console.log(`- Skipped: ${skipped} timers`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateTimerDuration()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateTimerDuration;
