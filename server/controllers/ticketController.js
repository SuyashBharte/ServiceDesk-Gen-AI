const Ticket = require('../models/Ticket');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// 🛡️ Helper: Standard Response Wrap
const success = (res, data) => res.json(data);
const error = (res, msg, status = 500) => res.status(status).json({ message: msg });

// 🤖 AI Helper: Simple Classification
const autoClassify = (text) => {
    const content = (text || '').toLowerCase();
    let category = 'IT';
    let priority = 'Low';
    if (content.match(/ac|leak|pipe|water|fan|bulb|light/)) category = 'Maintenance';
    if (content.match(/clean|trash|dirty|sweep/)) category = 'Housekeeping';
    if (content.match(/urgent|asap|critical|emergency|broken|help/)) priority = 'High';
    if (content.match(/not working|stopped|down/)) priority = 'Medium';
    return { category, priority };
};

const calculateDueDate = (priority) => {
    const now = new Date();
    if (priority === 'Critical') return new Date(now.getTime() + 2 * 60 * 60 * 1000);
    if (priority === 'High') return new Date(now.getTime() + 4 * 60 * 60 * 1000);
    if (priority === 'Medium') return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return new Date(now.getTime() + 48 * 60 * 60 * 1000);
};

// 🎯 Smart Assignment
const getSmartAssignee = async (category) => {
    try {
        const staff = await User.find({ role: 'staff' });
        if (staff.length === 0) return null;
        const staffWorkload = await Promise.all(staff.map(async (s) => {
            const count = await Ticket.countDocuments({ assignedTo: s._id, status: { $ne: 'Resolved' } });
            return { staffId: s._id, count };
        }));
        staffWorkload.sort((a, b) => a.count - b.count);
        return staffWorkload[0].staffId;
    } catch (e) { return null; }
};

// @controllers
const createTicket = async (req, res) => {
    try {
        const { title, description } = req.body;
        const { category, priority } = autoClassify(title + " " + description);
        const dueDate = calculateDueDate(priority);
        const assignedTo = await getSmartAssignee(category);

        const ticket = await Ticket.create({
            user: req.user._id,
            title, description, category, priority, dueDate, assignedTo, status: 'Open'
        });

        await AuditLog.create({
            ticket: ticket._id, user: req.user._id, action: 'CREATED',
            newValue: `Category: ${category}, Priority: ${priority}`, ipAddress: req.ip
        });

        res.status(201).json(ticket);
    } catch (e) { error(res, e.message); }
};

const getTickets = async (req, res) => {
    try {
        const filter = {};
        if (req.user.role === 'admin') { }
        else if (req.user.role === 'staff') filter.$or = [{ assignedTo: req.user._id }, { status: 'Open' }];
        else filter.user = req.user._id;

        const tickets = await Ticket.find(filter)
            .populate('user', 'name email')
            .populate('assignedTo', 'name')
            .sort('-createdAt');
        res.json(tickets);
    } catch (e) { error(res, e.message); }
};

const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate('user', 'name email').populate('assignedTo', 'name');
        if (!ticket) return error(res, 'Ticket not found', 404);
        const audits = await AuditLog.find({ ticket: ticket._id }).populate('user', 'name').sort('-createdAt');
        res.json({ ticket, audits });
    } catch (e) { error(res, e.message); }
};

const updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return error(res, 'Ticket not found', 404);

        const prevStatus = ticket.status;
        if (req.body.status) ticket.status = req.body.status;
        if (req.body.priority) {
            ticket.priority = req.body.priority;
            ticket.dueDate = calculateDueDate(ticket.priority);
        }

        if (req.body.remark) {
            ticket.logs.push({ updatedBy: req.user._id, message: req.body.remark });
        }

        const updated = await ticket.save();

        if (req.body.status && req.body.status !== prevStatus) {
            await AuditLog.create({
                ticket: ticket._id, user: req.user._id, action: 'STATUS_CHANGE',
                previousValue: prevStatus, newValue: req.body.status, ipAddress: req.ip
            });
        }
        res.json(updated);
    } catch (e) { error(res, e.message); }
};

const deleteTicket = async (req, res) => {
    try {
        await Ticket.findByIdAndDelete(req.params.id);
        res.json({ message: 'Ticket deleted' });
    } catch (e) { error(res, e.message); }
};

const getAnalytics = async (req, res) => {
    try {
        const [total, open, resolved, breached] = await Promise.all([
            Ticket.countDocuments(),
            Ticket.countDocuments({ status: 'Open' }),
            Ticket.countDocuments({ status: 'Resolved' }),
            Ticket.countDocuments({ slaStatus: 'Breached' })
        ]);

        const categoryData = await Ticket.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const staffPerformance = await Ticket.aggregate([
            { $match: { status: 'Resolved' } },
            {
                $group: {
                    _id: "$assignedTo",
                    avgRes: { $avg: { $subtract: ["$updatedAt", "$createdAt"] } },
                    count: { $sum: 1 }
                }
            },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'staff' } },
            { $unwind: { path: '$staff', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: { $ifNull: ['$staff.name', 'Unassigned'] },
                    avgHours: { $round: [{ $divide: ["$avgRes", 3600000] }, 1] },
                    count: 1
                }
            }
        ]);

        res.json({
            totalTickets: total,
            openTickets: open,
            resolvedTickets: resolved,
            breachedTickets: breached,
            categoryData,
            staffPerformance: staffPerformance.length > 0 ? staffPerformance : [{ name: 'No Data', avgHours: 0, count: 0 }]
        });
    } catch (e) { error(res, e.message); }
};

module.exports = { createTicket, getTickets, getTicketById, updateTicket, getAnalytics, deleteTicket };
