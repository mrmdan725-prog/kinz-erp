import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    Plus,
    Search,
    Filter,
    Calendar,
    User,
    Eye,
    Trash2,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronDown,
    LayoutGrid,
    List
} from 'lucide-react';
import InspectionForm from '../components/InspectionForm';

const Inspections = () => {
    const { inspections, deleteInspection, addInspection, customers, systemSettings } = useApp();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'

    const filteredInspections = inspections.filter(ins => {
        const matchesSearch = ins.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ins.representative && ins.representative.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || ins.status === statusFilter;
        const matchesType = typeFilter === 'all' || ins.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return { bg: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', icon: <CheckCircle2 size={14} />, label: 'مكتملة' };
            case 'planned':
                return { bg: 'rgba(255, 170, 0, 0.1)', color: '#ffaa00', icon: <Clock size={14} />, label: 'مخطط لها' };
            case 'cancelled':
                return { bg: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', icon: <AlertCircle size={14} />, label: 'ملغاة' };
            default:
                return { bg: 'rgba(255,255,255,0.05)', color: '#fff', label: status };
        }
    };



    const handleFormSubmit = (data) => {
        addInspection(data);
        setShowAddModal(false);
        setSelectedCustomer(null);
    };

    return (
        <div className="page arabic-text">
            <div className="page-header">
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <Calendar size={24} className="text-primary" />
                    <h2>إدارة المعاينات الفنية</h2>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <button className="btn-premium btn-premium-primary" onClick={() => setShowAddModal(true)}>
                        <div className="icon-wrapper-premium">
                            <Plus size={20} />
                        </div>
                        <div className="content-premium">
                            <span className="title-premium">إضافة معاينة جديدة</span>
                            <span className="subtitle-premium">جدولة موعد معاينة فنية</span>
                        </div>
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <div className="header-search-box glass" style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input
                        type="text"
                        placeholder="البحث باسم العميل أو المهندس..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 48px 12px 20px',
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '14px',
                            outline: 'none'
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

            <div className="filters-bar glass" style={{ marginBottom: '25px', padding: '15px', borderRadius: '12px' }}>
                <div className="smart-filters">
                    <div className="filter-group">
                        <span className="filter-label">الحالة:</span>
                        <div className="chips-container">
                            {[
                                { id: 'all', label: 'الكل' },
                                { id: 'planned', label: 'مخطط لها' },
                                { id: 'completed', label: 'مكتملة' },
                                { id: 'cancelled', label: 'ملغاة' }
                            ].map(chip => (
                                <button
                                    key={chip.id}
                                    className={`filter-chip ${statusFilter === chip.id ? 'active' : ''}`}
                                    onClick={() => setStatusFilter(chip.id)}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <span className="filter-label">النوع:</span>
                        <div className="chips-container">
                            {[
                                { id: 'all', label: 'الكل' },
                                { id: 'kitchen', label: 'مطبخ' },
                                { id: 'dressing', label: 'درسينج' }
                            ].map(chip => (
                                <button
                                    key={chip.id}
                                    className={`filter-chip ${typeFilter === chip.id ? 'active' : ''}`}
                                    onClick={() => setTypeFilter(chip.id)}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="table-container glass">
                    <table className="data-table" dir="rtl">
                        <thead>
                            <tr>
                                <th>التاريخ المخطط</th>
                                <th>العميل</th>
                                <th>النوع</th>
                                <th>المهندس</th>
                                <th className="text-center">الحالة</th>
                                <th className="text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInspections.map(ins => {
                                const status = getStatusBadge(ins.status);
                                return (
                                    <tr key={ins.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Calendar size={14} className="text-primary" />
                                                {new Date(ins.scheduledDate || ins.date).toLocaleDateString('ar-EG')}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <User size={14} className="text-primary" />
                                                {ins.customerName}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="type-badge">
                                                {ins.type === 'kitchen' ? 'مطبخ' : 'درسينج'}
                                            </span>
                                        </td>
                                        <td>{ins.representative || '---'}</td>
                                        <td className="text-center">
                                            <div className="status-badge-chip" style={{
                                                backgroundColor: status.bg,
                                                color: status.color
                                            }}>
                                                {status.icon}
                                                {status.label}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn-icon small" title="عرض التفاصيل" onClick={() => navigate(`/inspection/${ins.id}`)}>
                                                    <Eye size={16} />
                                                </button>
                                                <button className="btn-icon small text-danger" title="حذف" onClick={() => { if (window.confirm('حذف المعاينة؟')) deleteInspection(ins.id); }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredInspections.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>لا توجد معاينات تطابق البحث</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid">
                    {filteredInspections.length === 0 ? (
                        <div className="card glass text-center" style={{ gridColumn: '1 / -1', padding: '60px' }}>
                            <Calendar size={48} className="text-secondary" style={{ margin: '0 auto 16px' }} />
                            <p className="text-secondary">لا توجد معاينات تطابق البحث</p>
                        </div>
                    ) : (
                        filteredInspections.map(ins => {
                            const status = getStatusBadge(ins.status);
                            return (
                                <div key={ins.id} className="card glass inspection-card-enhanced">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-dim)' }}>
                                            <Calendar size={14} />
                                            {new Date(ins.scheduledDate || ins.date).toLocaleDateString('ar-EG')}
                                        </div>
                                        <div className="status-badge-chip small" style={{ backgroundColor: status.bg, color: status.color, padding: '2px 8px', fontSize: '10px' }}>
                                            {status.label}
                                        </div>
                                    </div>
                                    <h4 style={{ marginBottom: '5px' }}>{ins.customerName}</h4>
                                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '15px' }}>
                                        {ins.representative || 'بدون مهندس'} • {ins.type === 'kitchen' ? 'مطبخ' : 'درسينج'}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
                                        <button className="btn-icon-action" onClick={() => navigate(`/inspection/${ins.id}`)} title="عرض"><Eye size={16} /></button>
                                        <button className="btn-icon-action delete-btn" onClick={() => { if (window.confirm('حذف المعاينة؟')) deleteInspection(ins.id); }} title="حذف"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '800px', width: '95%' }}>
                        <div className="modal-header">
                            <h3>جدولة معاينة جديدة</h3>
                            <button className="btn-icon" onClick={() => setShowAddModal(false)}><Plus size={20} style={{ transform: 'rotate(45deg)' }} /></button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            {!selectedCustomer ? (
                                <>
                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label>اختر العميل</label>
                                        <select
                                            className="row-input"
                                            onChange={(e) => {
                                                const customer = customers.find(c => String(c.id) === String(e.target.value));
                                                if (customer) {
                                                    setSelectedCustomer(customer);
                                                }
                                            }}
                                        >
                                            <option value="">اختر عميل...</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                        نصيحة: يمكنك إضافة معاينة مباشرة من صفحة العميل لسهولة الربط.
                                    </p>
                                </>
                            ) : (
                                <InspectionForm
                                    customer={selectedCustomer}
                                    onSubmit={handleFormSubmit}
                                    onCancel={() => setSelectedCustomer(null)}
                                    type={selectedCustomer.projectType === 'dressing' ? 'dressing' : 'kitchen'}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
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
                .table-container {
                    border-radius: 15px;
                    overflow: hidden;
                }
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: right;
                }
                .data-table th {
                    padding: 15px;
                    background: rgba(255,255,255,0.03);
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                .data-table td {
                    padding: 15px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    font-size: 14px;
                }
                .status-badge-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .type-badge {
                    padding: 2px 8px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 4px;
                    font-size: 12px;
                }
                .actions-cell {
                    display: flex;
                    gap: 10px;
                }
            `}</style>
        </div>
    );
};

export default Inspections;
