import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    Settings as SettingsIcon,
    Users as UsersIcon,
    Shield,
    Globe,
    Plus,
    Trash2,
    Edit,
    Lock,
    User,
    Building,
    Check,
    ShoppingCart
} from 'lucide-react';

const SettingsScreen = () => {
    const { users, addUser, updateUser, deleteUser, systemSettings, updateSettings, defaultPermissions, currentUser, contractOptions, updateContractOptions, serviceItems, setServiceItems, factoryReset } = useApp();
    const [activeTab, setActiveTab] = useState('system'); // 'system', 'users', 'contract-terms', 'services'
    const [showUserModal, setShowUserModal] = useState(false);
    const [newServiceItem, setNewServiceItem] = useState({ name: '', defaultPrice: '' }); // State for new service item
    const [editMode, setEditMode] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'engineer', permissions: { ...defaultPermissions } });
    const [tempSettings, setTempSettings] = useState(systemSettings);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleSaveSettings = (e) => {
        e.preventDefault();
        updateSettings(tempSettings);
        alert('تم حفظ الإعدادات بنجاح! ✅');
    };

    const handleAddUser = (e) => {
        e.preventDefault();
        if (editMode && selectedUser) {
            updateUser({ ...selectedUser, ...newUser });
        } else {
            addUser(newUser);
        }
        setNewUser({ name: '', username: '', password: '', role: 'engineer', permissions: { ...defaultPermissions } });
        setShowUserModal(false);
        setEditMode(false);
        setSelectedUser(null);
    };

    const startEdit = (user) => {
        setSelectedUser(user);
        setNewUser({ name: user.name, username: user.username, password: user.password, role: user.role, permissions: user.permissions || { ...defaultPermissions } });
        setEditMode(true);
        setShowUserModal(true);
    };

    const togglePermission = (perm) => {
        setNewUser(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [perm]: !prev.permissions[perm]
            }
        }));
    };


    const handleAddServiceItem = (e) => {
        e.preventDefault();
        if (!newServiceItem.name || !newServiceItem.defaultPrice) return;

        const newItem = {
            id: `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: newServiceItem.name,
            defaultPrice: Number(newServiceItem.defaultPrice)
        };

        setServiceItems(prevItems => {
            const updatedItems = [...prevItems, newItem];
            localStorage.setItem('kinz_service_items', JSON.stringify(updatedItems));
            return updatedItems;
        });
        setNewServiceItem({ name: '', defaultPrice: '' });
    };

    const handleDeleteServiceItem = (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا البند؟')) {
            setServiceItems(prevItems => {
                const updatedItems = prevItems.filter(item => item.id !== id);
                localStorage.setItem('kinz_service_items', JSON.stringify(updatedItems));
                return updatedItems;
            });
        }
    };

    return (
        <div className="page arabic-text">
            <div className="page-header">
                <h2>الإعدادات والمستخدمين</h2>
            </div>

            <div className="settings-container glass">
                <div className="settings-sidebar">
                    <button
                        className={`settings-nav-item ${activeTab === 'system' ? 'active' : ''}`}
                        onClick={() => setActiveTab('system')}
                    >
                        <SettingsIcon size={18} />
                        <span>إعدادات النظام</span>
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <UsersIcon size={18} />
                        <span>إدارة المستخدمين</span>
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'services' ? 'active' : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        <ShoppingCart size={18} />
                        <span>بنود الخدمات / التكاليف</span>
                    </button>
                </div>

                <div className="settings-content">
                    {activeTab === 'system' ? (
                        <div className="settings-panel fade-in">
                            <h3><Globe size={20} className="text-primary" /> إعدادات الشركة</h3>
                            <form onSubmit={handleSaveSettings} style={{ marginTop: '24px' }}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>اسم الشركة</label>
                                        <div className="input-with-icon">
                                            <Building size={16} />
                                            <input
                                                type="text"
                                                value={tempSettings.companyName}
                                                onChange={e => setTempSettings({ ...tempSettings, companyName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>العملة</label>
                                        <input
                                            type="text"
                                            value={tempSettings.currency}
                                            onChange={e => setTempSettings({ ...tempSettings, currency: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>نسبة الضريبة (%)</label>
                                        <input
                                            type="number"
                                            value={tempSettings.taxRate}
                                            onChange={e => setTempSettings({ ...tempSettings, taxRate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>رسوم المعاينة الافتراضية</label>
                                        <input
                                            type="number"
                                            value={tempSettings.inspectionFee}
                                            onChange={e => setTempSettings({ ...tempSettings, inspectionFee: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>رقم الهاتف</label>
                                        <input
                                            type="text"
                                            value={tempSettings.phone}
                                            onChange={e => setTempSettings({ ...tempSettings, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>إسم ممثل الشركة الافتراضي</label>
                                        <div className="input-with-icon">
                                            <User size={16} />
                                            <input
                                                type="text"
                                                value={tempSettings.representativeName || ''}
                                                onChange={e => setTempSettings({ ...tempSettings, representativeName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>الرقم القومي للممثل</label>
                                        <div className="input-with-icon">
                                            <Shield size={16} />
                                            <input
                                                type="text"
                                                value={tempSettings.representativeNationalId || ''}
                                                onChange={e => setTempSettings({ ...tempSettings, representativeNationalId: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginTop: '10px' }}>
                                    <label>عنوان المقر</label>
                                    <textarea
                                        value={tempSettings.address}
                                        onChange={e => setTempSettings({ ...tempSettings, address: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="btn-primary" style={{ marginTop: '20px' }}>
                                    حفظ التغييرات
                                </button>
                            </form>

                        </div>
                    ) : activeTab === 'users' ? (
                        <div className="settings-panel fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3><Shield size={20} className="text-primary" /> المستخدمين الصلاحيات</h3>
                                <button className="btn-primary btn-small" onClick={() => setShowUserModal(true)}>
                                    <Plus size={16} />
                                    إضافة مستخدم
                                </button>
                            </div>

                            <div className="users-list">
                                {users.map(user => (
                                    <div key={user.id} className="user-card glass">
                                        <div className="user-info">
                                            <div className="user-avatar-small">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4>{user.name}</h4>
                                                <p className="text-secondary">@{user.username}</p>
                                            </div>
                                        </div>
                                        <div className="user-role-badge">
                                            {user.role === 'admin' ? 'مدير نظام' : 'مهندس'}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn-icon"
                                                onClick={() => startEdit(user)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn-icon text-danger"
                                                onClick={() => {
                                                    if (user.id === currentUser?.id) {
                                                        alert('لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول.');
                                                        return;
                                                    }
                                                    if (window.confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
                                                        deleteUser(user.id);
                                                    }
                                                }}
                                                disabled={user.id === currentUser?.id}
                                                title={user.id === currentUser?.id ? 'لا يمكن حذف الحساب الحالي' : 'حذف المستخدم'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : activeTab === 'services' ? (
                        <div className="settings-panel fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3><ShoppingCart size={20} className="text-primary" /> إدارة بنود الخدمات والتكاليف</h3>
                            </div>

                            <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(255,255,255,0.02)' }}>
                                <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)', fontSize: '14px' }}>إضافة بند جديد</h4>
                                <form onSubmit={handleAddServiceItem} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                    <div className="form-group" style={{ flex: 2, margin: 0 }}>
                                        <label style={{ fontSize: '12px' }}>اسم البند / الخدمة</label>
                                        <input
                                            type="text"
                                            placeholder="مثال: نقل، مشال، تركيب..."
                                            value={newServiceItem.name}
                                            onChange={(e) => setNewServiceItem({ ...newServiceItem, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                                        <label style={{ fontSize: '12px' }}>السعر الافتراضي</label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={newServiceItem.defaultPrice}
                                            onChange={(e) => setNewServiceItem({ ...newServiceItem, defaultPrice: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary" style={{ height: '42px', minWidth: '100px' }}>
                                        <Plus size={16} /> إضافة
                                    </button>
                                </form>
                            </div>

                            <div className="services-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                                {serviceItems.map(item => (
                                    <div key={item.id} className="service-item-card glass-interactive" style={{ padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div>
                                            <h4 style={{ fontSize: '15px', margin: '0 0 5px 0' }}>{item.name}</h4>
                                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                                {Number(item.defaultPrice).toLocaleString()} ج.م
                                            </span>
                                        </div>
                                        <button
                                            className="btn-icon text-danger"
                                            onClick={() => handleDeleteServiceItem(item.id)}
                                            style={{ background: 'rgba(255,0,0,0.1)', width: '30px', height: '30px' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {serviceItems.length === 0 && <p className="text-secondary" style={{ textAlign: 'center', gridColumn: '1/-1', padding: '20px' }}>لا توجد بنود مضافة</p>}
                            </div>
                        </div>
                    ) : null}
                </div>

                {
                    showUserModal && (
                        <div className="modal-overlay">
                            <div className="modal glass" style={{ maxWidth: '500px' }}>
                                <h3>{editMode ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}</h3>
                                <form onSubmit={handleAddUser}>
                                    <div className="form-group">
                                        <label>الاسم بالكامل</label>
                                        <input
                                            required
                                            type="text"
                                            value={newUser.name}
                                            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>اسم المستخدم</label>
                                            <div className="input-with-icon">
                                                <User size={16} />
                                                <input
                                                    required
                                                    type="text"
                                                    value={newUser.username}
                                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>كلمة المرور</label>
                                            <div className="input-with-icon">
                                                <Lock size={16} />
                                                <input
                                                    required
                                                    type="password"
                                                    value={newUser.password}
                                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>الصلاحية الرئيسية</label>
                                        <select
                                            value={newUser.role}
                                            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                        >
                                            <option value="engineer">مهندس</option>
                                            <option value="admin">مدير نظام</option>
                                        </select>
                                    </div>

                                    <div className="permissions-section" style={{ marginTop: '20px', textAlign: 'right' }}>
                                        <label style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', display: 'block' }}>الصلاحيات التفصيلية:</label>
                                        <div className="permissions-grid">
                                            {[
                                                { key: 'canViewDashboard', label: 'الوصول إلى لوحة التحكم (الرئيسية)' },
                                                { key: 'canManageUsers', label: 'التحكم في النظام والمستخدمين' },
                                                { key: 'canManagePurchases', label: 'إدارة طلبات الشراء' },
                                                { key: 'canManageInventory', label: 'التحكم في المخزون' },
                                                { key: 'canManageCustomers', label: 'إدارة بيانات العملاء' },
                                                { key: 'canManageFinance', label: 'إدارة المالية والمحسابات' },
                                                { key: 'canManageHR', label: 'شؤون الموظفين والرواتب' }
                                            ].map(perm => (
                                                <div key={perm.key} className="perm-item" onClick={() => togglePermission(perm.key)}>
                                                    <div className={`perm-checkbox ${newUser.permissions?.[perm.key] ? 'active' : ''}`}>
                                                        {newUser.permissions?.[perm.key] && <Check size={12} />}
                                                    </div>
                                                    <span>{perm.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="modal-actions">
                                        <button type="button" className="btn-secondary" onClick={() => { setShowUserModal(false); setEditMode(false); }}>إلغاء</button>
                                        <button type="submit" className="btn-primary">{editMode ? 'تحديث البيانات' : 'حفظ المستخدم'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                <style>{`
                .permissions-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 12px;
                    margin-top: 10px;
                }
                .perm-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: background 0.3s;
                }
                .perm-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
                .perm-checkbox {
                    width: 20px;
                    height: 20px;
                    border: 2px solid var(--border-color);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }
                .perm-checkbox.active {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: black;
                }
                .btn-icon.text-danger:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                .settings-container {
                    display: grid;
                    grid-template-columns: 240px 1fr;
                    min-height: 500px;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                }
                .settings-sidebar {
                    background: rgba(255, 255, 255, 0.02);
                    padding: 20px;
                    border-left: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .settings-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                    font-family: var(--font-arabic);
                    text-align: right;
                }
                .settings-nav-item:hover {
                    background: rgba(var(--primary-rgb), 0.1);
                    color: var(--primary);
                }
                .settings-nav-item.active {
                    background: var(--primary);
                    color: black;
                    font-weight: 600;
                }
                .settings-content {
                    padding: 40px;
                }
                .settings-panel h3 {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 20px;
                }
                .users-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .user-card {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-radius: 12px;
                }
                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .user-avatar-small {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: black;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }
                .user-role-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.05);
                    font-size: 12px;
                    border: 1px solid var(--border-color);
                }
                .input-with-icon {
                    position: relative;
                    width: 100%;
                }
                .input-with-icon svg {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                }
                .input-with-icon input {
                    padding-left: 40px !important;
                }
                .btn-small {
                    padding: 8px 16px;
                    font-size: 13px;
                }
                .terms-management-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }
                .term-category-card {
                    padding: 20px;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .term-category-card h4 {
                    color: var(--primary);
                    font-size: 16px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 8px;
                }
                .term-items-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    min-height: 40px;
                }
                .term-item-pill {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border-color);
                    padding: 4px 12px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                }
                .pill-remove {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-size: 16px;
                    line-height: 1;
                    padding: 0;
                }
                .pill-remove:hover {
                    color: #ef4444;
                }
                .add-term-input input {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px dashed var(--border-color);
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    color: white;
                }
                .add-term-input input:focus {
                    border-color: var(--primary);
                    outline: none;
                    background: rgba(0, 0, 0, 0.3);
                }
            `}</style>
            </div >
        </div >
    );
};

export default SettingsScreen;
