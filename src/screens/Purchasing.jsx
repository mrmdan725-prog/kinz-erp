import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, ShoppingCart, Calendar, User, Package, Edit, Trash2, FileText, Upload, X, FileSpreadsheet, LayoutGrid, List, Search } from 'lucide-react';
import { exportToExcel, formatters } from '../utils/excelExport';

const Purchasing = () => {
    const {
        accounts,
        customers,
        purchases,
        addPurchase,
        updatePurchase,
        deletePurchase,
        inventory,
        addInvoice,
        systemSettings,
        contractOptions,
        serviceItems // Added
    } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
    const [selectedGroupSerial, setSelectedGroupSerial] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        materialName: '',
        quantity: '',
        unitPrice: '',
        customerId: '',
        supplier: '',
        account: accounts[0]?.name || 'الخزنة الرئيسية',
        notes: '',
        unit: 'متر مربع',
        invoiceFile: null // base64 string
    });

    const handleEdit = (purchase) => {
        setFormData({
            date: purchase.date.split('T')[0],
            materialName: purchase.materialName,
            quantity: purchase.quantity,
            unitPrice: purchase.unitPrice,
            customerId: purchase.customerId,
            supplier: purchase.supplier || '',
            account: purchase.account || accounts[0]?.name || 'الخزنة الرئيسية',
            notes: purchase.notes || '',
            unit: purchase.unit || 'متر مربع',
            invoiceFile: purchase.invoiceFile || null
        });
        setIsEditing(true);
        setEditId(purchase.id);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('هل أنت متأكد من مسح هذه العملية؟ سيتم استرجاع المخزون المخصوم.')) {
            deletePurchase(id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.customerId) {
            alert('يجب اختيار العميل لإتمام عملية الشراء.');
            return;
        }
        const customer = customers.find(c => c.id === formData.customerId);
        const purchaseData = {
            ...formData,
            customerName: customer ? customer.name : 'غير معروف',
            total: Number(formData.quantity) * Number(formData.unitPrice)
        };

        if (isEditing) {
            updatePurchase({ ...purchaseData, id: editId });
        } else {
            addPurchase(purchaseData);
        }

        setShowModal(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            materialName: '',
            quantity: '',
            unitPrice: '',
            customerId: '',
            supplier: '',
            account: accounts[0]?.name || 'الخزنة الرئيسية',
            notes: '',
            unit: 'متر مربع',
            invoiceFile: null
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('حجم الملف كبير جداً. الحد الأقصى هو 2 ميجابايت.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, invoiceFile: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const viewInvoice = (fileData) => {
        if (!fileData) return;
        const newWindow = window.open();
        newWindow.document.write(`<iframe src="${fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    };



    const filteredPurchases = purchases.filter(p => {
        const matchesSearch = p.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.supplier && p.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesSearch;
    });

    const groupedPurchases = Object.entries(
        filteredPurchases.reduce((groups, item) => {
            const key = item.serialNumber || item.id;
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
        }, {})
    ).sort((a, b) => new Date(b[1][0].date) - new Date(a[1][0].date));

    const currentGroupItems = selectedGroupSerial
        ? purchases.filter(p => (p.serialNumber || p.id) === selectedGroupSerial)
        : [];

    const handleExport = () => {
        const dataToExport = filteredPurchases.map(formatters.purchase);
        exportToExcel(dataToExport, 'مشتريات_المواد', 'المشتريات');
    };

    return (
        <div className="page arabic-text">
            <div className="page-header">
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <ShoppingCart size={24} className="text-primary" />
                    <h2>مشتريات المواد</h2>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn-premium" onClick={handleExport} style={{ border: '1px solid rgba(46, 204, 113, 0.2)' }}>
                        <div className="icon-wrapper-premium" style={{ background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71' }}>
                            <FileSpreadsheet size={20} />
                        </div>
                        <div className="content-premium">
                            <span className="title-premium">تصدير البيانات</span>
                            <span className="subtitle-premium">سجل المشتريات (Excel)</span>
                        </div>
                    </button>
                    <button className="btn-premium btn-premium-primary" onClick={() => setShowModal(true)}>
                        <div className="icon-wrapper-premium">
                            <Plus size={20} />
                        </div>
                        <div className="content-premium">
                            <span className="title-premium">تسجيل شراء</span>
                            <span className="subtitle-premium">إضافة فاتورة مواد جديدة</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="header-search-box glass" style={{ marginBottom: '20px', width: '100%', maxWidth: '100%', background: 'rgba(255,255,255,0.03)' }}>
                <Search size={20} style={{ color: 'var(--text-dim)', marginLeft: '10px' }} />
                <input
                    type="text"
                    placeholder="البحث باسم المادة، العميل، أو المورد..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', padding: '10px' }}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <div className="layout-toggle">
                    <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="عرض الجدول"><List size={18} /></button>
                    <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="عرض المربعات"><LayoutGrid size={18} /></button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card glass">
                    <ShoppingCart className="text-primary" />
                    <div className="stat-info">
                        <span className="stat-label">إجمالي المشتروات</span>
                        <span className="stat-value">{purchases.length}</span>
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="table-container glass">
                    <table className="data-table" dir="rtl" style={{ textAlign: 'right' }}>
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>المادة</th>
                                <th>الكمية</th>
                                <th>السعر</th>
                                <th>العميل</th>
                                <th>المورد</th>
                                <th>الإجمالي</th>
                                <th className="text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedPurchases.map(([key, items]) => {
                                const firstItem = items[0];
                                const isGroup = items.length > 1 || (firstItem.serialNumber && firstItem.serialNumber.startsWith('PO-'));
                                const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);

                                return (
                                    <tr
                                        key={key}
                                        onDoubleClick={() => setSelectedGroupSerial(key)}
                                        style={{ cursor: 'pointer' }}
                                        title="اضغط مرتين للتفاصيل"
                                    >
                                        <td>{new Date(firstItem.date).toLocaleDateString()}</td>
                                        <td>
                                            {isGroup ? (
                                                <div style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                                    طلب توريد ({items.length} بنود)
                                                </div>
                                            ) : (
                                                firstItem.materialName
                                            )}
                                        </td>
                                        <td>
                                            {isGroup ? '---' : `${firstItem.quantity} `}
                                            <small className="text-secondary">{isGroup ? '' : firstItem.unit}</small>
                                        </td>
                                        <td>{isGroup ? '---' : `${firstItem.unitPrice} ج.م`}</td>
                                        <td>
                                            <div className="cell-flex">
                                                <User size={14} className="text-primary" />
                                                {firstItem.customerName || '---'}
                                            </div>
                                        </td>
                                        <td>{firstItem.supplier || '---'}</td>
                                        <td className="text-primary font-bold">
                                            {totalAmount.toLocaleString()} ج.م
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn-icon-action" onClick={() => setSelectedGroupSerial(key)} title="التفاصيل">
                                                    <LayoutGrid size={16} />
                                                </button>
                                                {items.length === 1 && (
                                                    <>
                                                        <button className="btn-icon-action" onClick={() => handleEdit(firstItem)} title="تعديل">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button className="btn-icon-action delete-btn" onClick={() => handleDelete(firstItem.id)} title="حذف">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {items.length > 1 && (
                                                    <button
                                                        className="btn-icon-action delete-btn"
                                                        onClick={() => {
                                                            if (window.confirm(`⚠️ حذف هذا الطلب سيؤدي لحذف جميع بنوده (${items.length} بند).\nهل أنت متأكد؟`)) {
                                                                items.forEach(item => deletePurchase(item.id));
                                                            }
                                                        }}
                                                        title="حذف الكل"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {groupedPurchases.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center">لا توجد عمليات شراء مسجلة تطابق البحث.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid">
                    {groupedPurchases.length === 0 ? (
                        <div className="card glass text-center" style={{ gridColumn: '1 / -1', padding: '60px' }}>
                            <ShoppingCart size={48} className="text-secondary" style={{ margin: '0 auto 16px' }} />
                            <p className="text-secondary">لا توجد عمليات شراء تطابق البحث</p>
                        </div>
                    ) : (
                        groupedPurchases.map(([key, items]) => {
                            const p = items[0];
                            const isGroup = items.length > 1;
                            const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);

                            return (
                                <div
                                    key={key}
                                    className="card glass purchase-card-enhanced"
                                    onDoubleClick={() => setSelectedGroupSerial(key)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{new Date(p.date).toLocaleDateString()}</span>
                                        <span className="badge" style={{ fontSize: '10px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
                                            {p.supplier || 'بدون مورد'}
                                        </span>
                                    </div>
                                    <h4 style={{ marginBottom: '5px' }}>
                                        {isGroup ? `طلب توريد (${items.length} بنود)` : p.materialName}
                                    </h4>
                                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '15px' }}>
                                        {p.customerName || '---'} {isGroup ? '' : `• ${p.quantity} ${p.unit}`}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
                                        <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                                            {totalAmount.toLocaleString()} ج.م
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-icon-action" onClick={() => setSelectedGroupSerial(key)} title="التفاصيل"><LayoutGrid size={16} /></button>
                                            {items.length === 1 && (
                                                <>
                                                    <button className="btn-icon-action" onClick={() => handleEdit(p)} title="تعديل"><Edit size={16} /></button>
                                                    <button className="btn-icon-action delete-btn" onClick={() => handleDelete(p.id)} title="حذف"><Trash2 size={16} /></button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {selectedGroupSerial && (
                <div className="modal-overlay" style={{ zIndex: 1100 }}>
                    <div className="modal glass" style={{ maxWidth: '800px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>تفاصيل طلب الشراء: {selectedGroupSerial.startsWith('PO-') ? selectedGroupSerial : 'طلب مجمع'}</h3>
                            <button className="btn-icon" onClick={() => setSelectedGroupSerial(null)}><X size={20} /></button>
                        </div>

                        <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', gap: '30px' }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)' }}>العميل</span>
                                <span style={{ fontWeight: '600' }}>{currentGroupItems[0]?.customerName}</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)' }}>المورد</span>
                                <span style={{ fontWeight: '600' }}>{currentGroupItems[0]?.supplier || '---'}</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)' }}>التاريخ</span>
                                <span style={{ fontWeight: '600' }}>{currentGroupItems[0] ? new Date(currentGroupItems[0].date).toLocaleDateString() : '---'}</span>
                            </div>
                            <div style={{ marginRight: 'auto', textAlign: 'left' }}>
                                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)' }}>الإجمالي</span>
                                <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--primary)' }}>
                                    {currentGroupItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0).toLocaleString()} ج.م
                                </span>
                            </div>
                        </div>

                        <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>البند / المادة</th>
                                        <th>الكمية</th>
                                        <th>سعر الوحدة</th>
                                        <th>الإجمالي</th>
                                        <th className="text-center">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentGroupItems.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.materialName}</td>
                                            <td>{p.quantity} {p.unit}</td>
                                            <td>{Number(p.unitPrice).toLocaleString()}</td>
                                            <td style={{ fontWeight: 'bold' }}>{(Number(p.quantity) * Number(p.unitPrice)).toLocaleString()}</td>
                                            <td>
                                                <div className="table-actions">
                                                    {p.invoiceFile && (
                                                        <button className="btn-icon-action" onClick={() => viewInvoice(p.invoiceFile)} title="عرض الفاتورة"><FileText size={14} /></button>
                                                    )}
                                                    <button className="btn-icon-action" onClick={() => handleEdit(p)} title="تعديل"><Edit size={14} /></button>
                                                    <button className="btn-icon-action delete-btn" onClick={() => handleDelete(p.id)} title="حذف"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="modal-actions" style={{ marginTop: '20px' }}>
                            <button className="btn-secondary" onClick={() => setSelectedGroupSerial(null)}>إغلاق</button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" style={{ zIndex: 1200 }}>
                    <div className="modal glass">
                        <h3>{isEditing ? 'تعديل عملية شراء' : 'تسجيل عملية شراء جديدة'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>تاريخ العملية</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>اسم المادة / الخدمة</label>
                                    <input
                                        required
                                        type="text"
                                        list="material-suggestions"
                                        placeholder="ابحث واختر الصنف..."
                                        value={formData.materialName}
                                        onChange={(e) => {
                                            const val = e.target.value;

                                            // Auto-fill price logic
                                            const serviceMatch = serviceItems.find(item => item.name === val);
                                            let newPrice = formData.unitPrice;
                                            let newNotes = formData.notes;

                                            if (serviceMatch) {
                                                newPrice = serviceMatch.defaultPrice;
                                                newNotes = newNotes ? newNotes : `تم اختيار بند: ${serviceMatch.name}`;
                                            }

                                            setFormData({
                                                ...formData,
                                                materialName: val,
                                                unitPrice: newPrice,
                                                notes: newNotes
                                            });
                                        }}
                                        className="row-input"
                                    />
                                    <datalist id="material-suggestions">
                                        {/* Service Items (Priority) */}
                                        {serviceItems.map(item => (
                                            <option key={item.id} value={item.name}>
                                                {item.name} - (سعر افتراضي: {item.defaultPrice})
                                            </option>
                                        ))}
                                        {/* Inventory Items */}
                                        {inventory.map(item => (
                                            <option key={item.id} value={item.name}>
                                                {item.name} - (مخزون: {item.stock})
                                            </option>
                                        ))}
                                    </datalist>
                                </div>
                                <div className="form-group">
                                    <label>العميل (مطلوب)</label>
                                    <select
                                        required
                                        value={formData.customerId}
                                        onChange={e => {
                                            const custId = e.target.value;
                                            const customer = customers.find(c => c.id === custId);
                                            setFormData({
                                                ...formData,
                                                customerId: custId,
                                                account: customer ? customer.name : (accounts[0]?.name || 'الخزنة الرئيسية')
                                            });
                                        }}
                                    >
                                        <option value="">اختر العميل...</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>الكمية</label>
                                    <input required type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>سعر الوحدة</label>
                                    <input required type="number" step="0.01" value={formData.unitPrice} onChange={e => setFormData({ ...formData, unitPrice: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>الوحدة</label>
                                    <select
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    >
                                        {contractOptions.units?.map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>المورد</label>
                                    <input required type="text" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>الحساب المستخدم</label>
                                    <select
                                        required
                                        value={formData.account}
                                        onChange={e => setFormData({ ...formData, account: e.target.value })}
                                    >
                                        <option value="">اختر الحساب</option>
                                        {formData.customerId && (
                                            <option value={customers.find(c => c.id === formData.customerId)?.name}>
                                                حساب العميل ({customers.find(c => c.id === formData.customerId)?.name})
                                            </option>
                                        )}
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.name}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>ملاحظات</label>
                                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label>إرفاق فاتورة (PDF / صور)</label>
                                <div className="file-upload-container">
                                    <input
                                        type="file"
                                        id="invoice-upload"
                                        accept="application/pdf,image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    {!formData.invoiceFile ? (
                                        <label htmlFor="invoice-upload" className="file-upload-label">
                                            <Upload size={18} />
                                            <span>اختر ملف الفاتورة</span>
                                        </label>
                                    ) : (
                                        <div className="file-preview-strip">
                                            <div className="file-info">
                                                <FileText size={18} className="text-primary" />
                                                <span>تم إرفاق فاتورة</span>
                                            </div>
                                            <button type="button" className="btn-icon small text-danger" onClick={() => setFormData({ ...formData, invoiceFile: null })}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => {
                                    setShowModal(false);
                                    setIsEditing(false);
                                    setEditId(null);
                                }}>إلغاء</button>
                                <button type="submit" className="btn-primary">
                                    {isEditing ? 'حفظ التغييرات' : 'تسجيل الشراء'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchasing;
