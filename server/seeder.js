const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Ticket.deleteMany();

        const users = await User.create([
            { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
            { name: 'Staff Support', email: 'staff@example.com', password: 'password123', role: 'staff', department: 'IT' },
            { name: 'John Doe', email: 'user@example.com', password: 'password123', role: 'user' },
        ]);

        const admin = users[0]._id;
        const staff = users[1]._id;
        const user = users[2]._id;

        await Ticket.create([
            { user: user, title: 'Internet is slow', description: 'Wifi speed is very low', category: 'IT', priority: 'High', status: 'Open' },
            { user: user, title: 'AC not cooling', description: 'Room 101 AC issue', category: 'Maintenance', priority: 'Medium', status: 'In Progress', assignedTo: staff },
        ]);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
