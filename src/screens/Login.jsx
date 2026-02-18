import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, LogIn, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
    const { login } = useApp();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Artificial delay for premium feel
        setTimeout(() => {
            const success = login(username, password);
            if (!success) {
                setError('اسم المستخدم أو كلمة المرور غير صحيحة');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="login-page">
            <div className="login-blob"></div>
            <div className="login-blob login-blob-2"></div>

            <div className="login-card glass fade-in">
                <div className="login-header">
                    <Logo width={300} className="login-logo-main" style={{ marginBottom: '30px', justifyContent: 'center' }} />
                    <h1>Kinz ERP System</h1>
                    <p>أهلاً بك في عالم كنز للأثاث والمطابخ، يرجى الدخول للمتابعة</p>
                </div>

                {error && <div className="login-error arabic-text">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>اسم المستخدم</label>
                        <div className="input-with-icon">
                            <User size={18} />
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="أدخل اسم المستخدم"
                                className="arabic-text"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>كلمة المرور</label>
                        <div className="input-with-icon">
                            <Lock size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-btn btn-primary" disabled={isLoading}>
                        {isLoading ? (
                            <div className="spinner"></div>
                        ) : (
                            <>
                                <span>دخول للنظام</span>
                                <LogIn size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <ShieldCheck size={14} />
                    <span>نظام مؤمن بالكامل</span>
                </div>
            </div>

            <style>{`
                .login-page {
                    height: 100vh;
                    width: 100vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                    position: relative;
                    overflow: hidden;
                }
                .login-blob {
                    position: absolute;
                    width: 500px;
                    height: 500px;
                    background: var(--primary);
                    filter: blur(150px);
                    opacity: 0.15;
                    top: -100px;
                    right: -100px;
                    z-index: 1;
                    animation: float 20s infinite alternate;
                }
                .login-blob-2 {
                    background: #3498db;
                    top: auto;
                    bottom: -150px;
                    left: -150px;
                    right: auto;
                    opacity: 0.1;
                }
                @keyframes float {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(50px, 50px); }
                }
                .login-card {
                    width: 100%;
                    max-width: 420px;
                    padding: 40px;
                    border-radius: 30px;
                    z-index: 2;
                    text-align: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                @media (max-width: 480px) {
                    .login-card {
                        padding: 30px 20px;
                        margin: 15px;
                        border-radius: 20px;
                    }
                    .login-header h1 {
                        font-size: 20px;
                    }
                }
                .login-logo {
                    width: 280px;
                    margin-bottom: 30px;
                }
                .login-header h1 {
                    font-size: 24px;
                    margin-bottom: 10px;
                    color: white;
                }
                .login-header p {
                    color: var(--text-secondary);
                    font-size: 14px;
                    margin-bottom: 30px;
                }
                .login-form {
                    text-align: right;
                }
                .login-btn {
                    width: 100%;
                    height: 50px;
                    justify-content: center;
                    margin-top: 20px;
                    font-size: 16px;
                }
                .login-error {
                    background: rgba(231, 76, 60, 0.1);
                    color: #e74c3c;
                    padding: 12px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    font-size: 14px;
                    border: 1px solid rgba(231, 76, 60, 0.2);
                }
                .login-footer {
                    margin-top: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    color: var(--text-secondary);
                    font-size: 12px;
                }
                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(0,0,0,0.1);
                    border-top: 2px solid black;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .input-with-icon svg {
                    position: absolute;
                    left: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                }
                .input-with-icon input {
                    padding-left: 45px !important;
                    height: 50px;
                }
            `}</style>
        </div >
    );
};

export default Login;
