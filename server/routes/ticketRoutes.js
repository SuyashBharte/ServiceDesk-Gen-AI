const express = require('express');
const router = express.Router();
const { createTicket, getTickets, getTicketById, updateTicket, getAnalytics, deleteTicket } = require('../controllers/ticketController');
const { protect, admin, staff } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createTicket)
    .get(protect, getTickets);

router.route('/analytics')
    .get(protect, admin, getAnalytics);

router.route('/:id')
    .get(protect, getTicketById)
    .put(protect, staff, updateTicket)
    .delete(protect, admin, deleteTicket);

module.exports = router;
