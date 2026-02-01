import { useAuth } from '../context/AuthContext';
import { FaTicketAlt, FaChartPie, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const { logout, user } = useAuth();

    return (
        <div className="sidebar">
            <div className="flex items-center gap-2 mb-8">
                <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTicketAlt color="white" />
                </div>
                <h3 style={{ fontSize: '1.25rem' }}>ServiceDesk</h3>
            </div>

            <div className="flex flex-col gap-2" style={{ flex: 1 }}>
                <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <FaTicketAlt />
                    <span>Tickets</span>
                </NavLink>
                {user?.role === 'admin' && (
                    <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <FaChartPie />
                        <span>Analytics</span>
                    </NavLink>
                )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaUser className="text-muted" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{user?.name}</div>
                        <div className="text-sm text-muted" style={{ textTransform: 'capitalize' }}>{user?.role}</div>
                    </div>
                </div>
                <button onClick={logout} className="nav-item w-full">
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
