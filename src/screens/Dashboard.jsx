import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    Users,
    ShoppingCart,
    Package,
    TrendingUp,
    Clock,
    ArrowUpRight,
    Plus,
    Eye,
    FileSpreadsheet,
    ChevronDown,
    ChevronUp,
    Receipt,
    History
} from 'lucide-react';
import { exportToExcel, formatters } from '../utils/excelExport';

const Dashboard = () => {
    const { customers, purchases, inventory, transactions, inventoryMovements } = useApp();
    const [activityLimit, setActivityLimit] = useState(5);

    const handleMasterExport = () => {
        const masterReport = {
            'العملاء': customers.map(formatters.customer),
            'العمليات المالية': transactions.map(formatters.transaction),
            'المشتريات': purchases.map(formatters.purchase),
            'المخزن': inventory.map(formatters.inventory)
        };
        exportToExcel(masterReport, 'تقرير_كنز_الشامل');
    };

    // Calculate basic stats
    const totalPurchases = purchases.reduce((acc, p) => acc + (parseFloat(p.total) || 0), 0);
    const lowStockItems = inventory.filter(item => item.stock <= (item.minStock || 5)).length;
    const itemsInStock = inventory.reduce((acc, item) => acc + (Number(item.stock) || 0), 0);

    // Sort recent activities
    const ALL_ACTIVITIES = [
        ...inventoryMovements.map(m => ({
            type: 'movement',
            name: m.itemName,
            date: new Date(m.date),
            detail: m.type === 'IN' ? 'توريد جديد' : m.type === 'OUT' ? 'صرف عهدة' : 'تسوية مخزنية',
            isPositive: m.type === 'IN'
        })),
        ...purchases.map(p => ({
            type: 'purchase',
            name: p.materialName,
            date: new Date(p.date),
            detail: `مورد: ${p.supplier}`,
            isPositive: false
        }))
    ].sort((a, b) => b.date - a.date);

    const recentActivities = ALL_ACTIVITIES.slice(0, activityLimit);

    return (
        <div className="page arabic-text dashboard-fade-in">
            {/* Hero Section */}
            <div className="hero-section glass dashboard-hero">
                <div className="hero-content">
                    <h1 className="hero-title text-gradient">
                        {new Date().getHours() < 12 ? 'صباح الخير' : 'مساء الخير'}، مدير كنز ✨
                    </h1>
                    <p className="hero-subtitle text-secondary">
                        أهلاً بك مجدداً في مركز القيادة الذكي. إليك نظرة شاملة على تطور أعمالك اليوم.
                    </p>
                </div>
                <div className="hero-actions" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button className="btn-premium btn-premium-primary" onClick={handleMasterExport}>
                        <div className="icon-wrapper-premium">
                            <FileSpreadsheet size={20} />
                        </div>
                        <div className="content-premium">
                            <span className="title-premium">التقرير الشامل</span>
                            <span className="subtitle-premium">تصدير كافة البيانات لإكسل</span>
                        </div>
                    </button>
                </div>
                {/* Decorative Elements */}
                <div className="hero-decoration"></div>
            </div>

            {/* Quick Actions (Integrated Hub) */}
            <div className="card glass dashboard-hub" style={{ marginBottom: '30px' }}>
                <div className="hub-header">
                    <h3 className="hub-title">اختصارات سريعة للمبدعين 🎨</h3>
                    <p className="text-secondary hub-subtitle">قم بإنجاز مهامك اليومية بسرعة فائقة</p>
                </div>
                <div className="hub-actions">
                    {[
                        { label: 'إضافة عميل', icon: Users, link: '/customers', color: '#3498db' },
                        { label: 'طلب شراء', icon: ShoppingCart, link: '/purchasing', color: '#e67e22' },
                        { label: 'تحليل المخزن', icon: Package, link: '/inventory', color: 'var(--primary)' }
                    ].map((btn, i) => (
                        <button
                            key={i}
                            className="quick-action-btn github-style glass-interactive"
                            onClick={() => window.location.href = btn.link}
                        >
                            <btn.icon size={20} style={{ color: btn.color }} />
                            <span className="btn-label">{btn.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="stats-grid dashboard-stats">
                <div className="dashboard-card glass" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="icon-box" style={{ background: 'rgba(var(--primary-rgb), 0.25)', color: 'var(--primary)', boxShadow: '0 0 15px rgba(var(--primary-rgb), 0.3)' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">إجمالي العملاء</span>
                        <h2 className="stat-value">{customers.length}</h2>
                    </div>
                </div>

                <div className="dashboard-card glass" style={{ borderLeft: '4px solid #3498db' }}>
                    <div className="icon-box" style={{ background: 'rgba(52, 152, 219, 0.25)', color: '#3498db', boxShadow: '0 0 15px rgba(52, 152, 219, 0.3)' }}>
                        <ShoppingCart size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">إجمالي المشتريات</span>
                        <h2 className="stat-value">{purchases.length}</h2>
                    </div>
                </div>

                <div className="dashboard-card glass" style={{ borderLeft: '4px solid #2ecc71' }}>
                    <div className="icon-box" style={{ background: 'rgba(46, 204, 113, 0.25)', color: '#2ecc71', boxShadow: '0 0 15px rgba(46, 204, 113, 0.3)' }}>
                        <Receipt size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">حساب الورشة (العهد)</span>
                        <h2 className="stat-value">
                            {(() => {
                                const acc = useApp().accounts?.find(a => a.name === 'حساب الورشة');
                                if (!acc) return 0;
                                // Calculate from transactions to ensure absolute accuracy
                                const calculated = transactions
                                    .filter(t => t.account === acc.name)
                                    .reduce((sum, t) => {
                                        const amount = Number(t.amount) || 0;
                                        return t.type === 'income' ? sum + amount : sum - amount;
                                    }, 0);
                                // Round to nearest integer after fixing precision to 2 decimals
                                return Math.round(Number(calculated.toFixed(2))).toLocaleString();
                            })()}
                            <small style={{ fontSize: '12px', marginRight: '5px' }}>ج.م</small>
                        </h2>
                    </div>
                </div>

                <div className="dashboard-card glass" style={{ borderLeft: '4px solid #f1c40f' }}>
                    <div className="icon-box" style={{ background: 'rgba(241, 196, 15, 0.25)', color: '#f1c40f', boxShadow: '0 0 15px rgba(241, 196, 15, 0.3)' }}>
                        <History size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">إجمالي النشاطات</span>
                        <h2 className="stat-value">{ALL_ACTIVITIES.length}</h2>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Active Users Performance Chart */}
                <div className="card glass-interactive dashboard-chart-card">
                    <div className="card-header-creative">
                        <div className="header-title-group">
                            <Users className="text-primary" size={20} />
                            <h3 className="chart-title">أداء العملاء النشطين</h3>
                        </div>
                        <span className="last-update" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>تحليل ميزانيات المشاريع</span>
                    </div>

                    <div className="chart-wrapper" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '20px', padding: '20px 0 10px' }}>
                        {(() => {
                            const activeCustomers = [...customers].sort((a, b) => (Number(b.balance) || 0) - (Number(a.balance) || 0)).slice(0, 4);
                            const maxBalance = Math.max(...activeCustomers.map(c => Number(c.balance) || 0), 1);

                            return activeCustomers.map((cust, i) => {
                                const balance = Number(cust.balance) || 0;
                                const percentage = Math.round((balance / maxBalance) * 100);
                                const colors = ['var(--primary)', '#3498db', '#2ecc71', '#9b59b6'];
                                const color = colors[i % colors.length];

                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '12px' }}>
                                        <div className="chart-value-label glass" style={{
                                            fontSize: '11px',
                                            fontWeight: '800',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            background: `${color}25`,
                                            color: 'white',
                                            border: `1px solid ${color}50`,
                                            marginBottom: '4px',
                                            whiteSpace: 'nowrap',
                                            boxShadow: `0 4px 10px ${color}30`
                                        }}>
                                            {balance.toLocaleString()}
                                        </div>
                                        <div style={{
                                            width: '40px',
                                            height: `${Math.max(percentage * 1.5, 15)}px`,
                                            background: `linear-gradient(to top, ${color}, ${color}60)`,
                                            borderRadius: '10px 10px 4px 4px',
                                            position: 'relative',
                                            boxShadow: `0 8px 25px ${color}40`,
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%', background: 'rgba(255,255,255,0.15)', borderRadius: '10px 10px 0 0' }}></div>
                                        </div>
                                        <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: '700', marginTop: '4px', textAlign: 'center', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {cust.name.split(' ')[0]}
                                        </span>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card glass dashboard-activity-card">
                    <div className="card-header-creative">
                        <div className="header-title-group">
                            <Clock style={{ color: '#e67e22' }} size={20} />
                            <h3 className="chart-title">آخر التحركات الذكية</h3>
                        </div>
                        <button
                            className="view-all-btn glass-btn"
                            onClick={() => setActivityLimit(prev => prev === 5 ? 20 : 5)}
                        >
                            <span>{activityLimit === 5 ? 'مشاهدة الكل' : 'عرض أقل'}</span>
                            {activityLimit === 5 ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </button>
                    </div>
                    <div className="activity-list">
                        {recentActivities.length > 0 ? recentActivities.map((act, i) => {
                            const colors = act.isPositive ? { bg: '#2ecc71', glow: 'rgba(46, 204, 113, 0.2)' } : { bg: '#e67e22', glow: 'rgba(230, 126, 34, 0.2)' };
                            return (
                                <div key={i} className="activity-item glass-interactive" style={{ borderRight: `3px solid ${colors.bg}`, marginBottom: '10px' }}>
                                    <div className="activity-icon-small" style={{
                                        background: colors.glow,
                                        color: colors.bg,
                                        borderRadius: '10px'
                                    }}>
                                        {act.type === 'movement' ? <History size={18} /> : <ShoppingCart size={18} />}
                                    </div>
                                    <div className="activity-details">
                                        <h4 className="activity-name" style={{ color: 'white' }}>{act.name}</h4>
                                        <div className="activity-meta">
                                            <p style={{ color: colors.bg, fontSize: '12px', fontWeight: 'bold' }}>{act.detail}</p>
                                            <span className="activity-date" style={{ color: 'var(--text-dim)', fontSize: '10px' }}>{act.date.toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-secondary empty-msg">لا توجد نشاطات مؤخراً</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
