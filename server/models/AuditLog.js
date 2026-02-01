const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema({
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String, // e.g., 'Created', 'Status Change', 'Assignment', 'SLA Breach'
        required: true,
    },
    previousValue: String,
    newValue: String,
    ipAddress: String,
    timestamp: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
