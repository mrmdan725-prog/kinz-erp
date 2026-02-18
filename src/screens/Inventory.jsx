import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    Package,
    Plus,
    Edit,
    Trash2,
    FileSpreadsheet,
    Search,
    ShieldAlert,
    ShoppingCart,
    X,
    ArrowDown,
    PlusCircle,
    MinusCircle
} from 'lucide-react';
import { exportToExcel, formatters } from '../utils/excelExport';

const Inventory = () => {
    const {
        inventory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addBulkPurchase,
        consumeMaterial,
        accounts,
        contractOptions
    } = useApp();

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'purchase'
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        unit: 'متر مربع',
        stock: '',
        minStock: '5',
        category: 'خامات',
        supplier: '',
        totalAmount: '',
        account: accounts[0]?.name || 'الخزنة الرئيسية'
    });

    const [bulkPurchaseData, setBulkPurchaseData] = useState({
        supplier: '',
        totalAmount: '',
        account: accounts[0]?.name || 'الخزنة الرئيسية',
        items: [{ materialName: '', quantity: '', unitPrice: '', unit: 'متر مربع' }]
    });

    const handleOpenModal = (type, item = null) => {
        setModalType(type);
        if (item) {
            setEditId(item.id);
            if (type === 'edit') {
                setFormData({
                    name: item.name,
                    unit: item.unit,
                    stock: item.stock,
                    minStock: item.minStock || '5',
                    category: item.category || 'خامات',
                    supplier: '',
                    totalAmount: '',
                    account: accounts[0]?.name || 'الخزنة الرئيسية'
                });
            } else if (type === 'purchase') {
                setBulkPurchaseData({
                    supplier: '',
                    totalAmount: '',
                    account: accounts[0]?.name || 'الخزنة الرئيسية',
                    items: [{ materialName: item.name, quantity: '', unitPrice: item.lastPrice || '', unit: item.unit }]
                });
            }
        } else {
            setFormData({
                name: '',
                unit: 'متر مربع',
                stock: '',
                minStock: '5',
                category: 'خامات',
                supplier: '',
                totalAmount: '',
                account: accounts[0]?.name || 'الخزنة الرئيسية'
            });
            setBulkPurchaseData({
                supplier: '',
                totalAmount: '',
                account: accounts[0]?.name || 'الخزنة الرئيسية',
                items: [{ materialName: '', quantity: '', unitPrice: '', unit: 'متر مربع' }]
            });
        }
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setEditId(null);
    };

    const handleAddBulkItem = () => {
        setBulkPurchaseData(prev => ({
            ...prev,
            items: [...prev.items, { materialName: '', quantity: '', unitPrice: '', unit: 'متر مربع' }]
        }));
    };

    const handleRemoveBulkItem = (index) => {
        setBulkPurchaseData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleBulkItemChange = (index, field, value) => {
        const newItems = [...bulkPurchaseData.items];
        newItems[index][field] = value;
        setBulkPurchaseData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmitItem = (e) => {
        e.preventDefault();
        const itemData = {
            ...formData,
            stock: Number(formData.stock),
            minStock: Number(formData.minStock)
        };

        if (modalType === 'edit') {
            updateInventoryItem({ ...itemData, id: editId });
        } else {
            addInventoryItem(itemData);

            // If supplier and totalAmount provided, record financial transaction
            if (formData.supplier && formData.totalAmount) {
                addBulkPurchase({
                    supplier: formData.supplier,
                    totalAmount: formData.totalAmount,
                    account: formData.account
                });
            }
        }
        handleClose();
    };

    const handleSubmitBulkPurchase = (e) => {
        e.preventDefault();
        addBulkPurchase(bulkPurchaseData);
        handleClose();
        alert('تم توريد مجموعة المواد للمخزن وتحديث الأرصدة المالية ✅');
    };

    const handleDelete = (id) => {
        if (window.confirm('هل أنت متأكد من مسح هذه المادة؟')) {
            deleteInventoryItem(id);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        const dataToExport = filteredInventory.map(formatters.inventory);
        exportToExcel(dataToExport, 'مخزون_كينز', 'المخزن');
    };

    const getStatusBadge = (stock, min = 5) => {
        if (stock <= 0) return <span className="badge badge-danger">نافذ</span>;
        if (stock <= min) return <span className="badge badge-warning">منخفض</span>;
        return <span className="badge badge-success">متوفر</span>;
    };

    return (
        <div className="page arabic-text">
            <div className="page-header">
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div className="legendary-icon-container">
                        <Package size={24} className="text-primary" />
                    </div>
                    <div>
                        <h2>مخزن كينز - Workshop Assets</h2>
                        <p className="text-secondary" style={{ fontSize: '13px' }}>إدارة عهدة الورشة والمواد الخام</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn-premium" onClick={handleExport} style={{ border: '1px solid rgba(46, 204, 113, 0.2)' }}>
                        <div className="icon-wrapper-premium" style={{ background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71' }}>
                            <FileSpreadsheet size={20} />
                        </div>
                        <div className="content-premium">
                            <span className="title-premium">تصدير الجرد</span>
                            <span className="subtitle-premium">قائمة المواد (Excel)</span>
                        </div>
                    </button>
                    <button className="btn-premium btn-premium-primary" onClick={() => handleOpenModal('add')}>
                        <div className="icon-wrapper-premium">
                            <Plus size={20} />
                        </div>
                        <div className="content-premium">
                            <span className="title-premium">إضافة مادة جديدة</span>
                            <span className="subtitle-premium">تسجيل عهدة ورشة جديدة</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card glass">
                    <div className="stat-icon-bg primary">
                        <Package size={22} className="text-primary" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">أنواع المواد</span>
                        <span className="stat-value">{inventory.length}</span>
                    </div>
                </div>

            </div>

            <div className="header-search-box glass" style={{ marginBottom: '20px', maxWidth: '100%', padding: '0 15px' }}>
                <Search size={18} style={{ color: 'var(--text-dim)' }} />
                <input
                    type="text"
                    placeholder="ابحث عن مادة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', padding: '12px 10px', fontSize: '15px' }}
                />
            </div>

            <div className="table-container glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <table className="data-table" dir="rtl">
                    <thead>
                        <tr>
                            <th>المادة</th>
                            <th>الرصيد</th>
                            <th>سعر الشراء</th>
                            <th className="text-center">الحالة</th>
                            <th className="text-center">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInventory.map(item => (
                            <tr key={item.id}>
                                <td style={{ fontWeight: '600' }}>{item.name}</td>
                                <td style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.stock} <small className="text-secondary">{item.unit}</small></td>
                                <td className="text-primary">{item.lastPrice ? `${item.lastPrice.toLocaleString()} ج.م` : '---'}</td>
                                <td className="text-center">{getStatusBadge(item.stock, item.minStock)}</td>
                                <td>
                                    <div className="table-actions">
                                        <button className="btn-icon-action" onClick={() => handleOpenModal('purchase', item)} title="توريد">
                                            <Plus size={15} className="text-primary" />
                                        </button>
                                        <button className="btn-icon-action" onClick={() => handleOpenModal('edit', item)} title="تعديل">
                                            <Edit size={15} />
                                        </button>
                                        <button className="btn-icon-action delete-btn" onClick={() => handleDelete(item.id)} title="حذف">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '500px', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px' }}>
                                {modalType === 'add' ? 'إضافة مادة جديدة' : 'تعديل بيانات مادة'}
                            </h3>
                            <button className="btn-icon" onClick={handleClose}><X size={20} /></button>
                        </div>


                        <form onSubmit={handleSubmitItem}>
                            <div className="form-group">
                                <label>اسم المادة</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="glass" placeholder="مثال: خشب حوائط، مفصلات، إلخ..." />
                            </div>
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>الوحدة</label>
                                    <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="glass">
                                        {contractOptions.units?.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>الرصيد الأولي</label>
                                    <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="glass" placeholder="0" />
                                </div>
                            </div>

                            {modalType === 'add' && (
                                <>
                                    <div style={{
                                        borderTop: '1px dashed rgba(255,255,255,0.1)',
                                        margin: '20px 0 16px',
                                        paddingTop: '16px'
                                    }}>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                            � معلومات الشراء (اختياري)
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>اسم المورد</label>
                                        <input
                                            type="text"
                                            value={formData.supplier}
                                            onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                                            className="glass"
                                            placeholder="اختياري - اسم المورد إن وجد"
                                        />
                                    </div>

                                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div className="form-group">
                                            <label>إجمالي المبلغ (ج.م)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.totalAmount}
                                                onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
                                                className="glass"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>الدفع من حساب</label>
                                            <select
                                                value={formData.account}
                                                onChange={e => setFormData({ ...formData, account: e.target.value })}
                                                className="glass"
                                            >
                                                {accounts.map(acc => (
                                                    <option key={acc.id} value={acc.name}>{acc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {formData.supplier && formData.totalAmount && (
                                        <div style={{
                                            background: 'rgba(var(--primary-rgb), 0.08)',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            color: 'var(--text-secondary)',
                                            border: '1px solid rgba(var(--primary-rgb), 0.2)'
                                        }}>
                                            💡 سيتم خصم {Number(formData.totalAmount).toLocaleString()} ج.م من {formData.account} وإضافته لحساب الورشة
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="modal-actions" style={{ marginTop: '24px' }}>
                                <button type="button" className="btn-secondary" onClick={handleClose}>إلغاء</button>
                                <button type="submit" className="btn-primary" style={{ width: modalType === 'add' ? 'auto' : '100%' }}>
                                    {modalType === 'add' ? '✅ إضافة المادة' : 'حفظ التعديلات'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
