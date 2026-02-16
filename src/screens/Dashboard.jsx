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
        exportToExcel(masterReport, 'تقرير_كينز_الشامل');
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
                        {new Date().getHours() < 12 ? 'صباح الخير' : 'مساء الخير'}، مدير كينز ✨
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
                        { label: 'تحليل المخزن', icon: Package, link: '/inventory', color: 'var(--primary)' },
                        { label: 'معاينة فنية', icon: Eye, link: '/inspections', color: '#9b59b6' }
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
                <div className="dashboard-card glass">
                    <div className="icon-box" style={{ background: 'rgba(var(--primary-rgb), 0.15)', color: 'var(--primary)' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">إجمالي العملاء</span>
                        <h2 className="stat-value">{customers.length}</h2>
                    </div>
                    <div className="card-decoration"></div>
                </div>

                <div className="dashboard-card glass">
                    <div className="icon-box" style={{ background: 'rgba(52, 152, 219, 0.15)', color: '#3498db' }}>
                        <ShoppingCart size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">إجمالي المشتريات</span>
                        <h2 className="stat-value">{purchases.length}</h2>
                    </div>
                    <div className="card-decoration" style={{ background: '#3498db' }}></div>
                </div>

                <div className="dashboard-card glass">
                    <div className="icon-box" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
                        <Receipt size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">حساب الورشة (العهد)</span>
                        <h2 className="stat-value">{(useApp().accounts?.find(a => a.name === 'حساب الورشة')?.balance || 0).toLocaleString()} <small style={{ fontSize: '12px' }}>ج.م</small></h2>
                    </div>
                    <div className="card-decoration" style={{ background: 'var(--primary)' }}></div>
                </div>

                <div className="dashboard-card glass">
                    <div className="icon-box" style={{ background: 'rgba(241, 196, 15, 0.15)', color: '#f1c40f' }}>
                        <Package size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">نواقص المخزون</span>
                        <h2 className="stat-value">{lowStockItems}</h2>
                    </div>
                    <div className="card-decoration" style={{ background: '#f1c40f' }}></div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Inventory Status Chart */}
                <div className="card glass-interactive dashboard-chart-card">
                    <div className="card-header-creative">
                        <div className="header-title-group">
                            <Package className="text-primary" size={20} />
                            <h3 className="chart-title">حالة المخزون الاستراتيجي</h3>
                        </div>
                        <span className="last-update">آخر تحديث: الآن</span>
                    </div>

                    <div className="chart-wrapper" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '20px', padding: '20px 0 10px' }}>
                        {(() => {
                            const topItems = [...inventory].sort((a, b) => b.stock - a.stock).slice(0, 4);
                            const maxStock = Math.max(...topItems.map(i => i.stock), 1);

                            return topItems.map((item, i) => {
                                const percentage = Math.round((item.stock / maxStock) * 100);
                                const colors = ['var(--primary)', '#3498db', '#e67e22', '#9b59b6'];
                                const color = colors[i % colors.length];

                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '12px' }}>
                                        <div className="chart-value-label glass" style={{
                                            fontSize: '11px',
                                            fontWeight: '800',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            background: `${color}15`,
                                            color: color,
                                            border: `1px solid ${color}30`,
                                            marginBottom: '4px',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {item.stock} {item.unit}
                                        </div>
                                        <div style={{
                                            width: '40px',
                                            height: `${Math.max(percentage * 1.5, 10)}px`,
                                            background: `linear-gradient(to top, ${color}, ${color}40)`,
                                            borderRadius: '8px 8px 4px 4px',
                                            position: 'relative',
                                            boxShadow: `0 4px 15px ${color}20`,
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}></div>
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '4px', textAlign: 'center' }}>{item.name}</span>
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
                            <Clock className="text-secondary" size={20} />
                            <h3 className="chart-title">النشاطات الذكية</h3>
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
                        {recentActivities.length > 0 ? recentActivities.map((act, i) => (
                            <div key={i} className="activity-item glass-interactive">
                                <div className="activity-icon-small" style={{
                                    background: act.isPositive ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(230, 126, 34, 0.1)',
                                    color: act.isPositive ? 'var(--primary)' : '#e67e22',
                                    borderRadius: '10px'
                                }}>
                                    {act.type === 'movement' ? <History size={18} /> : <ShoppingCart size={18} />}
                                </div>
                                <div className="activity-details">
                                    <h4 className="activity-name">{act.name}</h4>
                                    <div className="activity-meta">
                                        <p className="text-secondary">{act.detail}</p>
                                        <span className="activity-date">{act.date.toLocaleDateString('ar-EG')}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-secondary empty-msg">لا توجد نشاطات مؤخراً</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
