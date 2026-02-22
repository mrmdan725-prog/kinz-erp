import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    User,
    Mail,
    Shield,
    Lock,
    Eye,
    EyeOff,
    Check
} from 'lucide-react';

const UserProfile = () => {
    const { currentUser, darkMode } = useApp();
    const [showPassword, setShowPassword] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    if (!currentUser) return null;

    return (
        <div className="page" dir="rtl">
            {/* Hero Section */}
            <div className="profile-hero glass" style={{
                padding: '40px',
                borderRadius: 'var(--radius-xl)',
                marginBottom: '32px',
                background: darkMode
                    ? 'linear-gradient(135deg, hsla(var(--primary-h), 40%, 40%, 0.15) 0%, rgba(255, 255, 255, 0.02) 100%)'
                    : 'linear-gradient(135deg, #fffcf6 0%, #ffffff 100%)',
                border: darkMode ? '1px solid var(--border-glass)' : '1px solid rgba(var(--primary-rgb), 0.15)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: darkMode ? 'var(--shadow-premium)' : '0 15px 40px rgba(0,0,0,0.03)'
            }}>
                <div className="flex-responsive" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="avatar profile-avatar-large" style={{
                        width: '120px',
                        height: '120px',
                        fontSize: '48px',
                        background: 'var(--primary)',
                        color: darkMode ? 'black' : 'white',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        boxShadow: darkMode ? '0 20px 60px var(--primary-glow)' : '0 10px 30px rgba(var(--primary-rgb), 0.3)'
                    }}>
                        {currentUser.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '8px' }}>
                            {currentUser.name}
                        </h1>
                        <p style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                            {currentUser.role === 'admin' ? 'مدير نظام' : 'مهندس'} • <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{currentUser.username}@كينز</span>
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <div className="stat-badge glass" style={{ padding: '8px 16px', borderRadius: '20px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
                                <Shield size={16} style={{ color: 'var(--primary)' }} />
                                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>
                                    {currentUser.status === 'active' ? 'نشط' : 'غير نشط'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {!darkMode && (
                    <div style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '200px',
                        height: '200px',
                        background: 'var(--primary)',
                        filter: 'blur(100px)',
                        opacity: 0.08
                    }}></div>
                )}
            </div>

            <div className="grid" style={{ marginBottom: '32px' }}>
                {/* Personal Information */}
                <div className="card glass info-section-card" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card-glass)', border: '1px solid var(--border-glass)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                        <User size={20} className="text-primary" />
                        المعلومات الشخصية
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label className="text-secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                الاسم الكامل
                            </label>
                            <div className="info-display-box" style={{
                                padding: '12px 16px',
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-md)',
                                border: '1.5px solid var(--status-connector)',
                                color: 'var(--text-primary)',
                                fontWeight: '500'
                            }}>
                                {currentUser.name}
                            </div>
                        </div>
                        <div>
                            <label className="text-secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                اسم المستخدم
                            </label>
                            <div className="info-display-box" style={{
                                padding: '12px 16px',
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-md)',
                                border: '1.5px solid var(--status-connector)',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: '500'
                            }}>
                                <User size={16} style={{ color: 'var(--primary)' }} />
                                {currentUser.username}
                            </div>
                        </div>
                        {currentUser.email && (
                            <div>
                                <label className="text-secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                    البريد الإلكتروني
                                </label>
                                <div className="info-display-box" style={{
                                    padding: '12px 16px',
                                    background: 'var(--bg-glass)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1.5px solid var(--status-connector)',
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontWeight: '500'
                                }}>
                                    <Mail size={16} style={{ color: 'var(--primary)' }} />
                                    {currentUser.email}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* User Permissions */}
                <div className="card glass info-section-card" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card-glass)', border: '1px solid var(--border-glass)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                        <Shield size={20} className="text-primary" />
                        الصلاحيات الممنوحة
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {currentUser.permissions && Object.entries(currentUser.permissions).map(([key, value]) => {
                            const permissionLabels = {
                                canViewDashboard: 'عرض لوحة التحكم',
                                canManageUsers: 'إدارة المستخدمين',
                                canManagePurchases: 'إدارة المشتريات',
                                canManageInventory: 'إدارة المخزون',
                                canManageCustomers: 'إدارة العملاء',
                                canManageFinance: 'إدارة المالية',
                                canManageHR: 'إدارة الموظفين',
                                canManageInvoices: 'إدارة الفواتير',
                                canManageInspections: 'إدارة المعاينات'
                            };

                            return (
                                <div
                                    key={key}
                                    className={`permission-item ${value ? 'active' : ''}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 12px',
                                        background: value ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--bg-glass)',
                                        borderRadius: 'var(--radius-md)',
                                        border: `1.5px solid ${value ? 'var(--border-active)' : 'var(--status-connector)'}`,
                                        opacity: value ? 1 : 0.6
                                    }}
                                >
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '6px',
                                        background: value ? 'var(--primary)' : 'var(--status-connector)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {value && <Check size={14} style={{ color: darkMode ? 'black' : 'white' }} />}
                                    </div>
                                    <span style={{ fontSize: '13px', color: value ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: value ? '700' : 'normal' }}>
                                        {permissionLabels[key] || key}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Security Settings */}
            <div className="card glass info-section-card" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card-glass)', border: '1px solid var(--border-glass)' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                    <Lock size={20} className="text-primary" />
                    الأمان وكلمة المرور
                </h2>
                <div style={{ maxWidth: '600px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label className="text-secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                            كلمة المرور الحالية
                        </label>
                        <div className="info-display-box" style={{
                            padding: '12px 16px',
                            background: 'var(--bg-glass)',
                            borderRadius: 'var(--radius-md)',
                            border: '1.5px solid var(--status-connector)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontWeight: '500'
                        }}>
                            <span style={{ letterSpacing: showPassword ? '0' : '4px' }}>{showPassword ? currentUser.password : '••••••••'}</span>
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '4px'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button
                        className="btn btn-primary glass-interactive"
                        onClick={() => setIsEditingPassword(!isEditingPassword)}
                        style={{
                            padding: '12px 24px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '14px',
                            boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.2)'
                        }}
                    >
                        {isEditingPassword ? 'إلغاء' : 'تغيير كلمة المرور'}
                    </button>
                    {isEditingPassword && (
                        <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-active)' }}>
                            <p className="text-primary" style={{ fontSize: '13px', fontWeight: '600' }}>
                                لتغيير كلمة المرور، يرجى التواصل مع مدير النظام لتأمين حسابك بشكل كامل.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .light-theme .profile-hero {
                    background: linear-gradient(135deg, #fffcf6 0%, #ffffff 100%) !important;
                    border-color: rgba(var(--primary-rgb), 0.2) !important;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.02) !important;
                }
                .light-theme .info-section-card {
                    background: #ffffff !important;
                    border-color: #f1f5f9 !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02) !important;
                }
                .light-theme .info-display-box {
                    background: #f8fafc !important;
                    border-color: #e2e8f0 !important;
                    color: #1e293b !important;
                }
                .light-theme .permission-item {
                    background: #f8fafc !important;
                    border-color: #e2e8f0 !important;
                }
                .light-theme .permission-item.active {
                    background: #fffcf0 !important;
                    border-color: var(--primary) !important;
                }
                .light-theme .avatar {
                    color: white !important;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .light-theme .stat-badge {
                    background: #ffffff !important;
                    border-color: #f1f5f9 !important;
                }
            `}</style>
        </div>
    );
};

export default UserProfile;
