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
    const { currentUser } = useApp();
    const [showPassword, setShowPassword] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    if (!currentUser) return null;

    return (
        <div className="page" dir="rtl">
            {/* Hero Section */}
            <div className="glass" style={{
                padding: '40px',
                borderRadius: 'var(--radius-xl)',
                marginBottom: '32px',
                background: 'linear-gradient(135deg, hsla(var(--primary-h), 40%, 40%, 0.15) 0%, rgba(255, 255, 255, 0.02) 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="flex-responsive" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="avatar" style={{
                        width: '120px',
                        height: '120px',
                        fontSize: '48px',
                        background: 'var(--primary)',
                        color: 'black',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        boxShadow: '0 20px 60px var(--primary-glow)'
                    }}>
                        {currentUser.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 className="text-gradient" style={{ fontSize: '32px', marginBottom: '8px' }}>
                            {currentUser.name}
                        </h1>
                        <p className="text-secondary" style={{ fontSize: '16px', marginBottom: '16px' }}>
                            {currentUser.role === 'admin' ? 'مدير نظام' : 'مهندس'} • {currentUser.username}@كينز
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <div className="stat-badge glass" style={{ padding: '8px 16px', borderRadius: '20px' }}>
                                <Shield size={16} style={{ color: 'var(--primary)' }} />
                                <span style={{ fontSize: '13px' }}>
                                    {currentUser.status === 'active' ? 'نشط' : 'غير نشط'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.1 }}></div>
            </div>

            <div className="grid" style={{ marginBottom: '32px' }}>
                {/* Personal Information */}
                <div className="card glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <User size={20} className="text-primary" />
                        المعلومات الشخصية
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label className="text-secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                                الاسم الكامل
                            </label>
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-glass)',
                                color: 'white'
                            }}>
                                {currentUser.name}
                            </div>
                        </div>
                        <div>
                            <label className="text-secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                                اسم المستخدم
                            </label>
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-glass)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <User size={16} className="text-secondary" />
                                {currentUser.username}
                            </div>
                        </div>
                        {currentUser.email && (
                            <div>
                                <label className="text-secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                                    البريد الإلكتروني
                                </label>
                                <div style={{
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-glass)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <Mail size={16} className="text-secondary" />
                                    {currentUser.email}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* User Permissions */}
                <div className="card glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 12px',
                                        background: value ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(255,255,255,0.02)',
                                        borderRadius: 'var(--radius-md)',
                                        border: `1px solid ${value ? 'var(--border-active)' : 'var(--border-glass)'}`,
                                        opacity: value ? 1 : 0.5
                                    }}
                                >
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '6px',
                                        background: value ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {value && <Check size={14} style={{ color: 'black' }} />}
                                    </div>
                                    <span style={{ fontSize: '13px', color: value ? 'white' : 'var(--text-secondary)' }}>
                                        {permissionLabels[key] || key}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Security Settings */}
            <div className="card glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Lock size={20} className="text-primary" />
                    الأمان وكلمة المرور
                </h2>
                <div style={{ maxWidth: '600px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label className="text-secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                            كلمة المرور الحالية
                        </label>
                        <div style={{
                            padding: '12px 16px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-glass)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <span>{showPassword ? currentUser.password : '••••••••'}</span>
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center'
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
                            color: 'black',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        {isEditingPassword ? 'إلغاء' : 'تغيير كلمة المرور'}
                    </button>
                    {isEditingPassword && (
                        <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                            <p className="text-secondary" style={{ fontSize: '13px', marginBottom: '12px' }}>
                                لتغيير كلمة المرور، يرجى التواصل مع مدير النظام.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
