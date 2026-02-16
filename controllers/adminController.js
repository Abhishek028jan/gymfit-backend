const db = require('../config/db');

// @desc      Get Admin Stats
// @route     GET /api/admin/stats
// @access    Private/Admin
exports.getStats = async (req, res, next) => {
    try {
        // 1. Total Members
        const [totalMembersRows] = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'member'");
        const totalMembers = totalMembersRows[0].count;

        // 2. ACTIVE CLASSES
        const [activeClassesRows] = await db.execute("SELECT COUNT(*) as count FROM classes WHERE is_active = true");
        const activeClasses = activeClassesRows[0].count;

        // 3. TOTAL BOOKINGS
        const [totalBookingsRows] = await db.execute("SELECT COUNT(*) as count FROM bookings");
        const totalBookings = totalBookingsRows[0].count;

        // 4. TOTAL REVENUE (Approximation: $15 per booking)
        const totalRevenue = totalBookings * 15;

        // 5. Recent Members (Limit 5) - Exclude Pending
        const [recentMembers] = await db.execute(
            "SELECT id, first_name, last_name, email, created_at FROM users WHERE role = 'member' AND status != 'pending' ORDER BY created_at DESC LIMIT 5"
        );

        // 6. Recent Bookings (Limit 5)
        const [recentBookings] = await db.execute(`
            SELECT b.id, b.booking_date, b.status, 
                   u.first_name, u.last_name, 
                   c.name as class_name,
                   CONCAT(t.first_name, ' ', t.last_name) as trainer_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN classes c ON b.class_id = c.id
            LEFT JOIN users t ON c.trainer_id = t.id
            ORDER BY b.booking_date DESC 
            LIMIT 5
        `);

        res.status(200).json({
            success: true,
            data: {
                totalMembers,
                activeClasses,
                totalBookings,
                totalRevenue,
                recentMembers,
                recentBookings
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Get All Members
// @route     GET /api/admin/members
// @access    Private/Admin
exports.getMembers = async (req, res, next) => {
    try {
        const [members] = await db.execute(
            "SELECT id, first_name, last_name, email, role, created_at FROM users WHERE role = 'member' AND status = 'active' ORDER BY created_at DESC"
        );

        res.status(200).json({
            success: true,
            data: members
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Delete Member
// @route     DELETE /api/admin/members/:id
// @access    Private/Admin
exports.deleteMember = async (req, res, next) => {
    try {
        const { id } = req.params;

        await db.execute('DELETE FROM users WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Get All Trainers
// @route     GET /api/admin/trainers
// @access    Private/Admin
exports.getTrainers = async (req, res, next) => {
    try {
        const [trainers] = await db.execute(
            "SELECT id, first_name, last_name, email, role FROM users WHERE role = 'trainer' ORDER BY first_name ASC"
        );

        res.status(200).json({
            success: true,
            data: trainers
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Get All Programs
// @route     GET /api/admin/programs
// @access    Private/Admin
exports.getPrograms = async (req, res, next) => {
    try {
        const [programs] = await db.execute("SELECT * FROM programs ORDER BY name ASC");

        res.status(200).json({
            success: true,
            data: programs
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Get All Classes
// @route     GET /api/admin/classes
// @access    Private/Admin
exports.getClasses = async (req, res, next) => {
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

// @desc      Create A Class
// @route     POST /api/admin/classes
// @access    Private/Admin
exports.createClass = async (req, res, next) => {
    try {
        const {
            name, description, program_id, trainer_id, day_of_week,
            start_time, end_time, capacity, is_active
        } = req.body;

        const [result] = await db.execute(
            `INSERT INTO classes 
      (name, description, program_id, trainer_id, day_of_week, start_time, end_time, capacity, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description, program_id, trainer_id, day_of_week, start_time, end_time, capacity, is_active]
        );

        const [newClass] = await db.execute('SELECT * FROM classes WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            data: newClass[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Update A Class
// @route     PUT /api/admin/classes/:id
// @access    Private/Admin
exports.updateClass = async (req, res, next) => {
    try {
        const {
            name, description, program_id, trainer_id, day_of_week,
            start_time, end_time, capacity, is_active
        } = req.body;

        await db.execute(
            `UPDATE classes 
      SET name = ?, description = ?, program_id = ?, trainer_id = ?, 
          day_of_week = ?, start_time = ?, end_time = ?, capacity = ?, is_active = ?
      WHERE id = ?`,
            [name, description, program_id, trainer_id, day_of_week, start_time, end_time, capacity, is_active, req.params.id]
        );

        const [updatedClass] = await db.execute('SELECT * FROM classes WHERE id = ?', [req.params.id]);

        res.status(200).json({
            success: true,
            data: updatedClass[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Delete A Class
// @route     DELETE /api/admin/classes/:id
// @access    Private/Admin
exports.deleteClass = async (req, res, next) => {
    try {
        await db.execute('DELETE FROM classes WHERE id = ?', [req.params.id]);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
// @desc      Get Pending Members
// @route     GET /api/admin/pending-members
// @access    Private/Admin
exports.getPendingMembers = async (req, res, next) => {
    try {
        const [users] = await db.execute(
            "SELECT id, first_name, last_name, email, created_at FROM users WHERE role = 'member' AND status = 'pending' ORDER BY created_at DESC"
        );

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Update Member Status (Approve/Reject)
// @route     PUT /api/admin/members/:id/status
// @access    Private/Admin
exports.updateMemberStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active' or 'rejected'

        if (!['active', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        await db.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);

        if (status === 'rejected') {
            // Optional: Hard delete on reject or keep as soft banned?
            // User requested to "block" or "rejected" so keeping record with status is safer
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
