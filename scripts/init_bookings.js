const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function initBookings() {
    try {
        console.log('Running bookings initialization...');

        // Read schema file
        const schemaPath = path.join(__dirname, '../database', 'schema_bookings.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        await db.execute(schema);

        console.log('✅ Bookings table initialized');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error initializing bookings:', err);
        process.exit(1);
    }
}

initBookings();
