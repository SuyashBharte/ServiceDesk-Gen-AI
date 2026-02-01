import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginStyles.css'; // Import the new styles

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    // Add role to state defaults
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'user', confirmPassword: ''
    });
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isRegister && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            if (isRegister) {
                // Remove confirmPassword before sending
                const { confirmPassword, ...registerData } = formData;
                await register(registerData);
            } else {
                await login(formData.email, formData.password);
            }
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            if (!err.response) {
                setError('Network Error: Cannot connect to server at 127.0.0.1:5000. Is the backend running?');
            } else {
                setError(err.response.data?.message || 'Invalid Credentials');
            }
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setError('');
    };

    // Helper for demo login
    const fillDemo = (role) => {
        setFormData(prev => ({
            ...prev,
            email: `${role.toLowerCase()}@example.com`,
            password: 'password123'
        }));
    };

    return (
        <div className="login-page-body">
            <div className={`wrapper ${isRegister ? 'active' : ''}`} id="formWrapper">

                {/* LOGIN FORM */}
                <div className="form-container login">
                    <h2>Login As</h2>
                    {error && !isRegister && <div style={{ color: 'red', fontSize: '0.9rem', marginBottom: '10px' }}>{error}</div>}

                    {/* Demo Buttons */}
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                        {['Admin', 'Staff', 'User'].map(role => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => fillDemo(role)}
                                style={{
                                    flex: 1, padding: '5px', fontSize: '0.75rem',
                                    background: '#e0e7ff', border: 'none', borderRadius: '5px', color: '#1e3c72', cursor: 'pointer'
                                }}
                            >
                                {role}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <div className="forgot-password" tabIndex="0">Forgot password?</div>
                        <button type="submit" className="submit-btn" disabled={isRegister}>Login</button>
                    </form>

                </div>

                {/* SIGNUP FORM */}
                <div className="form-container signin">
                    <h2>Sign Up</h2>
                    {error && isRegister && <div style={{ color: 'red', fontSize: '0.9rem', marginBottom: '10px' }}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            style={{ marginTop: '0px' }}
                        >
                            <option value="user">User</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                        <label className="accept-terms">
                            <input type="checkbox" required /> I accept the terms & conditions
                        </label>
                        <button type="submit" className="submit-btn" disabled={!isRegister}>Sign Up</button>
                    </form>
                </div>

                {/* TOGGLE CONTAINER */}
                <div className="toggle-container">
                    <h2>{isRegister ? 'Already have an account?' : "Don't have an account?"}</h2>
                    <p>{isRegister ? 'Login to your account!' : 'Sign up to get started!'}</p>
                    <button className="switch-btn" onClick={toggleMode}>
                        {isRegister ? 'Login' : 'Sign Up'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Login;
