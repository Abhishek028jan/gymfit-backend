const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function initClasses() {
    try {
        console.log('Running class initialization...');

        // Read schema file
        const schemaPath = path.join(__dirname, '../database', 'schema_classes.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semi-colon
        const statements = schema.split(';').filter(s => s.trim());

        console.log('Creating tables...');
        for (const statement of statements) {
            await db.execute(statement);
        }

        // Seed programs if empty
        const [programs] = await db.execute('SELECT COUNT(*) as count FROM programs');
        if (programs[0].count === 0) {
            console.log('Seeding programs...');
            const seedPrograms = [
                ['Weight Loss', 'Programs designed to help you lose weight effectively.'],
                ['Muscle Gain', 'Strength training programs for building muscle mass.'],
                ['Yoga & Flexibility', 'Classes focused on flexibility, balance, and mindfulness.'],
                ['Cardio Fitness', 'High-energy classes to improve cardiovascular health.'],
                ['Endurance', 'Training to improve stamina and endurance.']
            ];

            for (const [name, desc] of seedPrograms) {
                await db.execute('INSERT INTO programs (name, description) VALUES (?, ?)', [name, desc]);
            }
            console.log('Programs seeded.');
        } else {
            console.log('Programs already exist, skipping seed.');
        }

        console.log('✅ Initialization complete');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error initializing classes:', err);
        process.exit(1);
    }
}

initClasses();
