const express = require('express');
const {
    getStats,
    getMembers,
    deleteMember,
    getTrainers,
    getPrograms,
    getClasses,
    createClass,
    updateClass,
    deleteClass,
    getPendingMembers,
    updateMemberStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and restricted to admin
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/members', getMembers);
router.route('/members/:id')
    .delete(protect, authorize('admin'), deleteMember);

router.route('/pending-members')
    .get(protect, authorize('admin'), getPendingMembers);

router.route('/members/:id/status')
    .put(protect, authorize('admin'), updateMemberStatus);

// Trainer Routes
router.get('/trainers', getTrainers);

// Program Routes
router.get('/programs', getPrograms);

// Class Routes
router.get('/classes', getClasses);
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);

module.exports = router;
