const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String, // e.g., IT, Plumbing, Electrical
        required: true,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Low',
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open',
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Staff member
    },
    dueDate: {
        type: Date, // Calculated based on Priority
    },
    isEscalated: {
        type: Boolean,
        default: false,
    },
    escalationLevel: {
        type: Number,
        default: 0, // 0: Staff, 1: Manager, 2: Admin
    },
    slaStatus: {
        type: String,
        enum: ['Within SLA', 'At Risk', 'Breached'],
        default: 'Within SLA',
    },
    logs: [{
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        timestamp: { type: Date, default: Date.now }
    }],
    resolutionTime: {
        type: Number, // In hours or minutes
    },
    feedback: {
        rating: Number,
        comment: String,
    }
}, {
    timestamps: true,
});

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
