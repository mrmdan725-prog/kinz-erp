import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    Plus,
    Search,
    Filter,
    Download,
    Printer,
    MoreVertical,
    CheckCircle,
    Clock,
    XCircle,
    ArrowRight,
    ChevronDown,
    LayoutGrid,
    List,
    FileText,
    FileSpreadsheet,
    Eye,
    Trash2,
    Tag,
    ClipboardCheck,
    Settings2,
    Layers
} from 'lucide-react';

const Invoices = () => {
    const { invoices, deleteInvoice, customers } = useApp();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        const matchesType = typeFilter === 'all' || inv.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'paid': return { bg: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', icon: <CheckCircle size={14} />, label: 'مدفوعة' };
            case 'draft': return { bg: 'rgba(255, 170, 0, 0.1)', color: '#ffaa00', icon: <Clock size={14} />, label: 'مسودة' };
            case 'cancelled': return { bg: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', icon: <XCircle size={14} />, label: 'ملغاة' };
            default: return { bg: 'rgba(255,255,255,0.05)', color: '#fff', label: status };
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'inspection': return 'معاينة';
            case 'contract': return 'تعاقد مشروع';
            case 'material': return 'مشتريات خامات';
            case 'payment': return 'دفعة مرحلية';
            default: return type;
        }
    };

    return (
        <div className="page">
            <div className="module-header">
                <div className="module-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <div className="legendary-icon-container" style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
                            <FileText size={24} color="white" />
                        </div>
                        <h1 style={{ fontSize: '24px' }}>إدارة الفواتير</h1>
                    </div>
                    <p>عرض وإصدار الفواتير الرسمية للعملاء وتتبع المدفوعات.</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                        <div className="header-search-box" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <Search size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                            <input
                                type="text"
                                placeholder="البحث باسم العميل أو رقم الفاتورة..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="glass"
                                style={{
                                    width: '100%',
                                    padding: '12px 48px 12px 20px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.03)',
                                    color: 'white',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div className="layout-toggle">
                            <button
                                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title="عرض القائمة"
                            >
                                <List size={20} />
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="عرض الشبكة"
                            >
                                <LayoutGrid size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="module-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button className="btn-primary" onClick={() => alert('يمكنك إصدار فاتورة من داخل تفاصيل العميل أو التعاقد حالياً')} style={{ height: '40px', padding: '0 20px', borderRadius: '10px', boxShadow: '0 8px 16px rgba(var(--primary-rgb), 0.2)' }}>
                        <Plus size={18} />
                        فاتورة جديدة
                    </button>
                </div>
            </div>

            {/* Compact Filter Tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="filter-label" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>الحالة</div>
                    <div className="filter-tabs-container glass" style={{ padding: '6px', borderRadius: '16px', display: 'inline-flex', gap: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {[
                            { id: 'all', label: 'الكل', icon: <Layers size={14} />, color: 'var(--primary)' },
                            { id: 'draft', label: 'مسودة', icon: <Clock size={14} />, color: '#ffaa00' },
                            { id: 'paid', label: 'مدفوعة', icon: <CheckCircle size={14} />, color: '#10b981' },
                            { id: 'cancelled', label: 'ملغاة', icon: <XCircle size={14} />, color: '#ef4444' }
                        ].map(chip => (
                            <button
                                key={chip.id}
                                className={`premium-tab ${statusFilter === chip.id ? 'active' : ''}`}
                                onClick={() => setStatusFilter(chip.id)}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontWeight: '800',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    background: statusFilter === chip.id ? (chip.id === 'all' ? 'var(--primary)' : chip.color) : 'transparent',
                                    color: statusFilter === chip.id ? 'white' : 'rgba(255,255,255,0.5)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: statusFilter === chip.id ? `0 8px 16px ${chip.id === 'all' ? 'rgba(70, 174, 92, 0.2)' : `rgba(${chip.id === 'paid' ? '16, 185, 129' : (chip.id === 'cancelled' ? '239, 68, 68' : '255, 170, 0')}, 0.2)`}` : 'none'
                                }}
                            >
                                {chip.icon}
                                <span>{chip.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="filter-label" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>النوع</div>
                    <div className="filter-tabs-container glass" style={{ padding: '6px', borderRadius: '16px', display: 'inline-flex', gap: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {[
                            { id: 'all', label: 'جميع الأنواع', icon: <Filter size={14} /> },
                            { id: 'sales', label: 'مبيعات', icon: <Tag size={14} /> },
                            { id: 'contract', label: 'عقد', icon: <FileText size={14} /> },
                            { id: 'maintenance', label: 'صيانة', icon: <Settings2 size={14} /> },
                            { id: 'inspection', label: 'معاينة', icon: <ClipboardCheck size={14} /> }
                        ].map(chip => (
                            <button
                                key={chip.id}
                                className={`premium-tab ${typeFilter === chip.id ? 'active' : ''}`}
                                onClick={() => setTypeFilter(chip.id)}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontWeight: '800',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    background: typeFilter === chip.id ? 'var(--primary)' : 'transparent',
                                    color: typeFilter === chip.id ? 'white' : 'rgba(255,255,255,0.5)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: typeFilter === chip.id ? '0 8px 16px rgba(70, 174, 92, 0.2)' : 'none'
                                }}
                            >
                                {chip.icon}
                                <span>{chip.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="invoices-table-container glass">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>رقم الفاتورة</th>
                                <th>العميل</th>
                                <th>التاريخ</th>
                                <th>النوع</th>
                                <th>الإجمالي</th>
                                <th className="text-center">الحالة</th>
                                <th className="text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map(inv => {
                                const status = getStatusStyle(inv.status);
                                return (
                                    <tr key={inv.id} onClick={() => navigate(`/invoice/${inv.id}`)} className="clickable-row">
                                        <td className="font-bold">{inv.number}</td>
                                        <td>{inv.customerName}</td>
                                        <td>{new Date(inv.date).toLocaleDateString('ar-EG')}</td>
                                        <td>
                                            <span className="type-tag">{getTypeLabel(inv.type)}</span>
                                        </td>
                                        <td className="font-bold">{(inv.totalAmount || 0).toLocaleString()} <small>ج.م</small></td>
                                        <td className="text-center">
                                            <div className="status-badge" style={{ backgroundColor: status.bg, color: status.color }}>
                                                {status.icon}
                                                <span>{status.label}</span>
                                            </div>
                                        </td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <div className="table-actions">
                                                <button className="btn-icon" title="طباعة" onClick={() => navigate(`/invoice/${inv.id}`)}><Printer size={16} /></button>
                                                <button className="btn-icon text-danger" title="حذف" onClick={() => { if (window.confirm('حذف الفاتورة؟')) deleteInvoice(inv.id); }}><XCircle size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="empty-row">لا توجد فواتير تطابق البحث</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid">
                    {filteredInvoices.length === 0 ? (
                        <div className="card glass text-center" style={{ gridColumn: '1 / -1', padding: '60px' }}>
                            <FileText size={48} className="text-secondary" style={{ margin: '0 auto 16px' }} />
                            <p className="text-secondary">لا توجد فواتير تطابق البحث</p>
                        </div>
                    ) : (
                        filteredInvoices.map(inv => {
                            const status = getStatusStyle(inv.status);
                            return (
                                <div key={inv.id} className="card glass invoice-card-enhanced" onClick={() => navigate(`/invoice/${inv.id}`)} style={{ cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{inv.number}</span>
                                        <div className="status-badge" style={{ backgroundColor: status.bg, color: status.color, fontSize: '10px', padding: '2px 8px' }}>
                                            {status.label}
                                        </div>
                                    </div>
                                    <h4 style={{ marginBottom: '5px' }}>{inv.customerName}</h4>
                                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '15px' }}>
                                        {new Date(inv.date).toLocaleDateString('ar-EG')} • {getTypeLabel(inv.type)}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
                                        <button className="btn-icon-action" onClick={() => navigate(`/invoice/${inv.id}`)} title="عرض الفاتورة"><Eye size={16} /></button>
                                        <button className="btn-icon-action" onClick={() => alert('جاري تجهيز ميزة التحميل...')} title="تحميل PDF"><Download size={16} /></button>
                                        <button className="btn-icon-action delete-btn" onClick={() => { if (window.confirm('حذف الفاتورة؟')) deleteInvoice(inv.id); }} title="حذف"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            <style>{`
                .invoices-screen {
                    padding: 5px;
                }
                .screen-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }
                .filters-bar {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    padding: 20px;
                    border-radius: 16px;
                    margin-bottom: 25px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 10px 18px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s;
                }
                .search-box:focus-within {
                    border-color: var(--primary);
                    background: rgba(255, 255, 255, 0.08);
                }
                .search-box input {
                    background: transparent;
                    border: none;
                    color: white;
                    width: 100%;
                    outline: none;
                    font-size: 14px;
                }
                .smart-filters {
                    display: flex;
                    gap: 30px;
                    flex-wrap: wrap;
                }
                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .filter-label {
                    font-size: 13px;
                    color: var(--text-secondary);
                    font-weight: 600;
                    white-space: nowrap;
                }
                .chips-container {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .filter-chip {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: var(--text-secondary);
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .filter-chip:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                    color: white;
                }
                .filter-chip.active {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: white;
                    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
                    transform: translateY(-1px);
                }
                .invoices-table-container {
                    border-radius: 15px;
                    overflow: hidden;
                }
                .modern-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: right;
                }
                .modern-table th {
                    padding: 15px 20px;
                    background: rgba(255,255,255,0.03);
                    font-size: 13px;
                    color: var(--text-secondary);
                    font-weight: 600;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .modern-table td {
                    padding: 15px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    font-size: 14px;
                }
                .clickable-row {
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .clickable-row:hover {
                    background: rgba(var(--primary-rgb), 0.05);
                }
                .font-bold {
                    font-weight: 700;
                }
                .type-tag {
                    padding: 2px 8px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 4px;
                    font-size: 11px;
                }
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .row-actions {
                    display: flex;
                    gap: 8px;
                }
                .empty-row {
                    padding: 40px;
                    text-align: center;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
};

export default Invoices;
