const db = require('../config/db');

// @desc      Get Schedule (All Classes)
// @route     GET /api/bookings/schedule
// @access    Private (Member)
exports.getSchedule = async (req, res, next) => {
    try {
        const sql = `
            SELECT c.*, 
                   CONCAT(t.first_name, ' ', t.last_name) as trainer_name,
                   p.name as program_name
            FROM classes c
            LEFT JOIN users t ON c.trainer_id = t.id
            LEFT JOIN programs p ON c.program_id = p.id
            ORDER BY c.day_of_week, c.start_time ASC
        `;
        const [classes] = await db.execute(sql);

        res.status(200).json({
            success: true,
            data: classes
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Book a class
// @route     POST /api/bookings/:classId
// @access    Private (Member)
exports.bookClass = async (req, res, next) => {
    try {
        const { classId } = req.params;
        const userId = req.user.id;

        // 1. Check if class exists and has space
        const [classes] = await db.execute('SELECT * FROM classes WHERE id = ?', [classId]);

        if (classes.length === 0) {
            return res.status(404).json({ success: false, error: 'Class not found' });
        }

        const classInfo = classes[0];

        if (classInfo.current_bookings >= classInfo.capacity) {
            return res.status(400).json({ success: false, error: 'Class is full' });
        }

        // 2. Check if user already booked
        const [existing] = await db.execute(
            'SELECT * FROM bookings WHERE user_id = ? AND class_id = ?',
            [userId, classId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, error: 'You are already booked for this class' });
        }

        // 3. Create booking
        await db.execute(
            "INSERT INTO bookings (user_id, class_id, status) VALUES (?, ?, 'confirmed')",
            [userId, classId]
        );

        // 4. Update class capacity
        await db.execute(
            'UPDATE classes SET current_bookings = current_bookings + 1 WHERE id = ?',
            [classId]
        );

        res.status(201).json({
            success: true,
            data: { message: 'Booking confirmed' }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Get my bookings
// @route     GET /api/bookings
// @access    Private (Member)
exports.getMyBookings = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const sql = `
            SELECT b.id as booking_id, b.status, b.class_id,
                   c.name, c.start_time, c.end_time, c.day_of_week,
                   CONCAT(t.first_name, ' ', t.last_name) as trainer_name
            FROM bookings b
            JOIN classes c ON b.class_id = c.id
            LEFT JOIN users t ON c.trainer_id = t.id
            WHERE b.user_id = ?
            ORDER BY c.day_of_week ASC
        `;

        const [bookings] = await db.execute(sql, [userId]);

        res.status(200).json({
            success: true,
            data: bookings
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Cancel booking
// @route     DELETE /api/bookings/:bookingId
// @access    Private (Member)
exports.cancelBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;

        // 1. Get booking to find class_id
        const [booking] = await db.execute(
            'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
            [bookingId, userId]
        );

        if (booking.length === 0) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        const classId = booking[0].class_id;

        // 2. Delete booking
        await db.execute('DELETE FROM bookings WHERE id = ?', [bookingId]);

        // 3. Update class capacity
        await db.execute(
            'UPDATE classes SET current_bookings = current_bookings - 1 WHERE id = ?',
            [classId]
        );

        res.status(200).json({
            success: true,
            data: {}
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
