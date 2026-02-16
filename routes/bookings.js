const express = require('express');
const { bookClass, getMyBookings, cancelBooking, getSchedule } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes private

router.get('/schedule', getSchedule);
router.post('/:classId', bookClass);
router.get('/', getMyBookings);
router.delete('/:bookingId', cancelBooking);

module.exports = router;
