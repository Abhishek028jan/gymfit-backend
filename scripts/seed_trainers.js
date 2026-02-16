const db = require('../config/db');
const bcrypt = require('bcryptjs');

const trainers = [
    {
        name: 'Mike Johnson',
        first_name: 'Mike',
        last_name: 'Johnson',
        email: 'mike@gymfit.com',
        password: 'trainer1',
        specialization: 'HIIT & Cardio'
    },
    {
        name: 'Sarah Connor',
        first_name: 'Sarah',
        last_name: 'Connor',
        email: 'sarah@gymfit.com',
        password: 'trainer2',
        specialization: 'Strength & Conditioning'
    },
    {
        name: 'John Doe',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@gymfit.com',
        password: 'trainer3',
        specialization: 'Yoga & Pilates'
    }
];

const seedTrainers = async () => {
    try {
        console.log('🌱 Seeding Trainers...');

        for (const trainer of trainers) {
            // Check if exists
            const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [trainer.email]);

            if (existing.length > 0) {
                console.log(`⚠️ Trainer ${trainer.email} already exists. Skipping.`);
                continue;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(trainer.password, salt);

            await db.execute(
                "INSERT INTO users (name, first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?, 'trainer')",
                [trainer.name, trainer.first_name, trainer.last_name, trainer.email, hashedPassword]
            );

            console.log(`✅ Created trainer: ${trainer.name}`);
        }

        console.log('🎉 Trainer seeding completed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedTrainers();
