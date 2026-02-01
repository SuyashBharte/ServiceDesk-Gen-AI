import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import AIChatbot from '../components/AIChatbot';
import { FaPlus, FaSearch, FaClock, FaHistory, FaRobot, FaTicketAlt, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- STYLES & HELPERS ---
const getStatusParams = (status) => {
    switch (status) {
        case 'Open': return 'badge badge-open';
        case 'In Progress': return 'badge badge-progress';
        case 'Resolved': return 'badge badge-resolved';
        default: return 'badge badge-progress';
    }
};

const calculateDeadline = (p) => {
    const now = new Date();
    let offset = 48; // Default Low
    if (p === 'Critical') offset = 2;
    if (p === 'High') offset = 4;
    if (p === 'Medium') offset = 24;
    return new Date(now.getTime() + offset * 60 * 60 * 1000).toISOString().slice(0, 16);
};

// --- SUB-COMPONENTS ---
const TicketModal = ({ ticket: ticketProp, onClose, refresh }) => {
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', category: 'IT', priority: 'Low', status: 'Open', remark: '', dueDate: ''
    });

    const isEdit = !!ticketProp;

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            axios.get(`/tickets/${ticketProp._id}`).then(({ data }) => {
                setTicket(data.ticket);
                setAudits(data.audits || []);
                setFormData({
                    title: data.ticket?.title || '',
                    description: data.ticket?.description || '',
                    category: data.ticket?.category || 'IT',
                    status: data.ticket?.status || 'Open',
                    priority: data.ticket?.priority || 'Low',
                    dueDate: data.ticket?.dueDate ? new Date(data.ticket.dueDate).toISOString().slice(0, 16) : calculateDeadline(data.ticket?.priority || 'Low'),
                    remark: ''
                });
                setLoading(false);
            }).catch(() => setLoading(false));
        } else {
            setFormData(prev => ({ ...prev, dueDate: calculateDeadline('Low') }));
        }
    }, [ticketProp, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) await axios.put(`/tickets/${ticketProp._id}`, formData);
            else await axios.post('/tickets', formData);
            refresh();
            onClose();
        } catch (error) { console.error('Submission failed', error); }
    };

    if (isEdit && loading) return <div className="loading-overlay"><div className="animate-spin loader"></div></div>;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(10px)' }}>
            <div className="card animate-fade-in" style={{ width: '900px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', display: 'grid', gridTemplateColumns: isEdit ? '1.2fr 0.8fr' : '1fr', gap: '30px', color: 'white', border: '1px solid var(--border)' }}>
                <div className="p-2">
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>{isEdit ? 'Manage Ticket' : 'Raise Ticket'}</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {isEdit && ticket ? (
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                <h3 className="mb-2 text-primary">{ticket.title}</h3>
                                <p className="text-sm text-muted">{ticket.description}</p>
                            </div>
                        ) : !isEdit ? (
                            <>
                                <input className="input" placeholder="Ticket Subject" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                                <textarea className="input" placeholder="Detailed Description..." rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                            </>
                        ) : null}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted block mb-1">Category</label>
                                <select className="input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} disabled={isEdit}>
                                    <option value="IT">IT Support</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Housekeeping">Housekeeping</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-muted block mb-1">Priority</label>
                                <select className="input" value={formData.priority} onChange={(e) => {
                                    const p = e.target.value;
                                    setFormData({ ...formData, priority: p, dueDate: calculateDeadline(p) });
                                }} disabled={user?.role === 'user'}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                        </div>

                        {isEdit && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-muted block mb-1">Status</label>
                                    <select className="input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} disabled={user?.role === 'user'}>
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-muted block mb-1">SLA Target</label>
                                    <input type="datetime-local" className="input" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} disabled={user?.role === 'user'} />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs text-muted block mb-1">Add Remark</label>
                            <textarea className="input" placeholder="Updates or notes..." rows="2" value={formData.remark} onChange={e => setFormData({ ...formData, remark: e.target.value })} />
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
                            <button type="submit" className="btn btn-primary px-8">Confirm</button>
                        </div>
                    </form>
                </div>

                {isEdit && (
                    <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
                        <h3 className="mb-4 flex items-center gap-2"><FaHistory className="text-primary" /> Activity</h3>
                        <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                            {audits.length > 0 ? audits.map((a, i) => (
                                <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-primary font-bold">{a.user?.name || 'System'}</span>
                                        <span className="text-muted" style={{ fontSize: '10px' }}>{new Date(a.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="font-medium">{a.action}</div>
                                    <div className="text-muted mt-1">➜ {a.newValue}</div>
                                </div>
                            )) : <div className="text-muted italic text-center text-sm p-4">No activity yet.</div>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
const Dashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [tickets, setTickets] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [search, setSearch] = useState('');

    const isAnalytics = location.pathname === '/analytics';

    const fetchData = async () => {
        setLoading(true);
        try {
            if (isAnalytics && user?.role === 'admin') {
                const { data } = await axios.get('/tickets/analytics');
                setAnalytics(data);
            } else {
                const { data } = await axios.get('/tickets');
                setTickets(data);
            }
        } catch (e) {
            console.error('Fetch error:', e);
            setTickets([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user) fetchData();
    }, [isAnalytics, user]);

    const filteredTickets = (tickets || []).filter(t =>
        (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.status || '').toLowerCase().includes(search.toLowerCase())
    );

    const getSLAText = (ticket) => {
        if (!ticket.dueDate) return '---';
        const diff = new Date(ticket.dueDate) - new Date();
        if (ticket.status === 'Resolved') return <span className="text-success">Resolved</span>;
        if (diff < 0) return <span className="text-danger font-bold">!!! OVERDUE</span>;
        return `${Math.floor(diff / 3600000)}h left`;
    };

    const renderKPI = (label, value, color) => (
        <div className="card">
            <p className="text-muted text-sm mb-1">{label}</p>
            <h2 style={{ fontSize: '2.5rem', color: color || 'white' }}>{value ?? 0}</h2>
        </div>
    );

    return (
        <div className="flex" style={{ background: 'var(--bg-dark)', minHeight: '100vh' }}>
            <Sidebar />
            <main className="main-content w-full p-8">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1>{isAnalytics ? 'Organization Analytics' : 'Service Desk Monitor'}</h1>
                        <p className="text-muted">Welcome back, <span className="text-primary font-bold">{user?.name}</span> ({user?.role})</p>
                    </div>
                    {!isAnalytics && (
                        <button className="btn btn-primary" onClick={() => { setSelectedTicket(null); setShowModal(true); }}>
                            <FaPlus /> New Ticket
                        </button>
                    )}
                </header>

                {loading ? (
                    <div className="flex items-center justify-center p-20"><div className="animate-spin loader"></div></div>
                ) : isAnalytics ? (
                    user?.role === 'admin' ? (
                        <div className="grid gap-6">
                            <div className="grid grid-cols-4 gap-4">
                                {renderKPI('Active Requests', analytics?.totalTickets)}
                                {renderKPI('Resolved', analytics?.resolvedTickets, 'var(--success)')}
                                {renderKPI('SLA Breaches', analytics?.breachedTickets, 'var(--danger)')}
                                {renderKPI('System Load', 'High', 'var(--warning)')}
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="card">
                                    <h3 className="mb-6"><FaShieldAlt className="mr-2 inline" /> Tickets per Category</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analytics?.categoryData || []}>
                                            <XAxis dataKey="_id" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                                            <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="card">
                                    <h3 className="mb-6"><FaHistory className="mr-2 inline" /> Resolve Efficiency (h)</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analytics?.staffPerformance || []}>
                                            <XAxis dataKey="name" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                                            <Bar dataKey="avgHours" fill="var(--success)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card text-center p-20">
                            <FaExclamationTriangle size={50} className="text-warning mb-4" />
                            <h3>Admin Access Required</h3>
                            <p className="text-muted">Please contact the system administrator to view organization analytics.</p>
                        </div>
                    )
                ) : (
                    <div className="card" style={{ padding: 0 }}>
                        <div className="p-6 flex justify-between items-center border-b">
                            <h3><FaTicketAlt className="mr-2 inline text-primary" /> Active Ticket Monitor</h3>
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-3 text-muted" />
                                <input className="input" style={{ paddingLeft: '2.5rem', width: '350px' }} placeholder="Filter tickets..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                        </div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Title & User</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Urgency</th>
                                    <th>Deadline</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.map(t => (
                                    <tr key={t._id}>
                                        <td>
                                            <div className="font-bold">{t.title}</div>
                                            <div className="text-xs text-muted">User: {t.user?.name}</div>
                                        </td>
                                        <td>{t.category}</td>
                                        <td><span className={getStatusParams(t.status)}>{t.status}</span></td>
                                        <td>{t.priority}</td>
                                        <td>{getSLAText(t)}</td>
                                        <td>
                                            <button className="btn btn-ghost text-primary text-sm" onClick={() => { setSelectedTicket(t); setShowModal(true); }}>Manage</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredTickets.length === 0 && <div className="p-20 text-center text-muted">Awaiting intake...</div>}
                    </div>
                )}
            </main>
            <AIChatbot onTicketCreated={fetchData} />
            {showModal && <TicketModal ticket={selectedTicket} onClose={() => setShowModal(false)} refresh={fetchData} />}
        </div>
    );
};

export default Dashboard;
