const db = require('../config/db');

// @desc      Get Trainer's Schedule (Classes assigned to them)
// @route     GET /api/trainer/bookings
// @access    Private (Trainer)
exports.getTrainerBookings = async (req, res, next) => {
    try {
        const trainerId = req.user.id;

        // Fetch classes assigned to this trainer
        const sql = `
            SELECT c.*, 
                   p.name as program_name,
                   (SELECT COUNT(*) FROM bookings b WHERE b.class_id = c.id) as confirmed_attendees
            FROM classes c
            LEFT JOIN programs p ON c.program_id = p.id
            WHERE c.trainer_id = ?
            ORDER BY c.day_of_week, c.start_time ASC
        `;

        const [classes] = await db.execute(sql, [trainerId]);

        res.status(200).json({
            success: true,
            data: classes
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Get Trainer Dashboard Stats
// @route     GET /api/trainer/dashboard
// @access    Private (Trainer)
exports.getTrainerDashboard = async (req, res, next) => {
    try {
        const trainerId = req.user.id;

        // 1. Get Trainer Details
        const [trainer] = await db.execute('SELECT first_name, last_name, email FROM users WHERE id = ?', [trainerId]);

        // 2. Get Upcoming Bookings Count
        // Count of all bookings for classes taught by this trainer
        const [bookingCount] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM bookings b 
            JOIN classes c ON b.class_id = c.id 
            WHERE c.trainer_id = ?
        `, [trainerId]);

        // 3. Get Unique Clients Count
        const [clientCount] = await db.execute(`
            SELECT COUNT(DISTINCT b.user_id) as count 
            FROM bookings b 
            JOIN classes c ON b.class_id = c.id 
            WHERE c.trainer_id = ?
        `, [trainerId]);

        // 4. Calculate Total Earnings (Dummy calculation: $20 per booking * count)
        const totalEarnings = bookingCount[0].count * 20;

        res.status(200).json({
            success: true,
            trainer: {
                ...trainer[0],
                specialization: 'Certified Trainer', // Placeholder or add to DB
                experience_years: 5, // Placeholder
                hourly_rate: 50, // Placeholder
                rating: 4.8 // Placeholder
            },
            upcomingBookings: bookingCount[0].count,
            totalEarnings: totalEarnings,
            uniqueClients: clientCount[0].count
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Get Class Attendees
// @route     GET /api/trainer/classes/:classId/attendees
// @access    Private (Trainer)
exports.getClassAttendees = async (req, res, next) => {
    try {
        const { classId } = req.params;
        const trainerId = req.user.id;

        // Verify class belongs to trainer
        const [classCheck] = await db.execute('SELECT * FROM classes WHERE id = ? AND trainer_id = ?', [classId, trainerId]);
        if (classCheck.length === 0) {
            return res.status(403).json({ success: false, error: 'Not authorized to view this class' });
        }

        // Fetch attendees
        const [attendees] = await db.execute(`
            SELECT u.id, u.first_name, u.last_name, u.email, b.booking_date 
            FROM bookings b 
            JOIN users u ON b.user_id = u.id 
            WHERE b.class_id = ?
            ORDER BY u.last_name ASC
        `, [classId]);

        res.status(200).json({
            success: true,
            data: attendees
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Update Availability
// @route     POST /api/trainer/availability
// @access    Private (Trainer)
exports.updateAvailability = async (req, res, next) => {
    try {
        const trainerId = req.user.id;
        const { availability } = req.body;

        // TODO: Implement actual DB storage
        console.log(`Updating availability for trainer ${trainerId}:`, req.body);

        res.status(200).json({
            success: true,
            message: 'Availability updated'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
