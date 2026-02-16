const express = require('express');
const { getTrainerBookings, getTrainerDashboard, getClassAttendees, updateAvailability } = require('../controllers/trainerController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getTrainerDashboard);
router.get('/bookings', getTrainerBookings);
router.get('/classes/:classId/attendees', getClassAttendees);
router.post('/availability', updateAvailability);

module.exports = router;
