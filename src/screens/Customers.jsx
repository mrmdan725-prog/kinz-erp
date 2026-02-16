import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import InspectionForm from '../components/InspectionForm';
import {
    Plus,
    Search,
    User,
    Eye,
    History,
    FileText,
    ShoppingCart,
    Calendar,
    DollarSign,
    Package,
    PencilLine,
    Trash2,
    UserMinus,
    FileSpreadsheet,
    Users,
    LayoutGrid,
    List,
    Info,
    CreditCard,
    Edit, // Added
    Settings, // Added
    Truck, // Added
    CheckCircle, // Added
    X // Added
} from 'lucide-react';
import { exportToExcel, formatters } from '../utils/excelExport';

const Customers = () => {
    const {
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        purchases,
        transactions,
        inventory,
        accounts,
        addPurchase,
        inspections,
        addInspection,
        updateInspection,
        deleteInspection,
        addInvoice,
        addTransaction,
        deleteTransaction,
        resetAllCustomerBalances,
        systemSettings,
        contractOptions
    } = useApp();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        projectType: 'مطبخ', // Default to match contractOptions
        projectCost: '', // New Field: Manual Project Cost / Budget
        status: 'design' // Default Status
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('info'); // info, contracts, purchases, finances, inspections
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [inspectionType, setInspectionType] = useState('kitchen');

    const [purchaseData, setPurchaseData] = useState({
        supplier: '',
        items: [{
            serviceName: '',
            price: ''
        }],
        account: accounts[0]?.name || 'الخزنة الرئيسية'
    });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        account: accounts[0]?.name || 'الخزنة الرئيسية',
        category: 'دفعة تعاقد'
    });
    const activeCustomer = selectedCustomer ? (customers.find(c => c.id === selectedCustomer.id) || selectedCustomer) : null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing && selectedCustomer) {
            updateCustomer({ ...selectedCustomer, ...formData });
        } else {
            addCustomer(formData);
        }
        setShowModal(false);
        setIsEditing(false);
        setShowModal(false);
        setIsEditing(false);
        setFormData({ name: '', phone: '', address: '', email: '', projectType: 'مطبخ', projectCost: '', status: 'design' });
    };


    const [showPurchaseDetails, setShowPurchaseDetails] = useState(false);
    const [selectedPurchaseItem, setSelectedPurchaseItem] = useState(null);

    const handlePurchaseItemDoubleClick = (item) => {
        setSelectedPurchaseItem(item);
        setShowPurchaseDetails(true);
    };

    const handlePurchaseSubmit = (e) => {
        e.preventDefault();

        const serialNumber = `PO-${Date.now()}`; // Generate unique serial for this batch

        purchaseData.items.forEach((item, index) => {
            if (item.serviceName && item.price) {
                const totalAmount = Number(item.price);

                // 1. Inventory & History (Recorded as Service Purchase)
                addPurchase({
                    materialName: item.serviceName,
                    quantity: 1,
                    unitPrice: item.price,
                    unit: 'قطعة', // Default unit
                    customerName: activeCustomer.name,
                    customerId: activeCustomer.id,
                    account: activeCustomer.name,
                    total: totalAmount,
                    supplier: purchaseData.supplier, // Add Supplier
                    skipInventory: true, // Do NOT add to workshop inventory
                    skipFinancials: true, // Do NOT add to workshop accounts/treasury
                    serialNumber: serialNumber // Group items
                });

                // 2. Financial Transaction (Deduct Balance)
                addTransaction({
                    type: 'expense', // Expense = Deduct (Profit Mode)
                    amount: totalAmount,
                    date: new Date().toISOString(),
                    account: activeCustomer.name,
                    category: `خدمة/توريد: ${item.serviceName}`,
                    notes: `توريد: ${item.serviceName} - مورد: ${purchaseData.supplier || 'بدون'} (${serialNumber})`,
                    customerName: activeCustomer.name
                });
            }
        });

        setShowPurchaseModal(false);
        setPurchaseData({
            supplier: '',
            items: [{
                serviceName: '',
                price: ''
            }],
            account: accounts[0]?.name || 'الخزنة الرئيسية'
        });
    };


    const handleAddInspection = (customer, type) => {
        setSelectedCustomer(customer);
        setInspectionType(type);
        setShowInspectionModal(true);
    };

    const handleInspectionSubmit = (data) => {
        addInspection(data);
        setShowInspectionModal(false);
        setActiveTab('inspections');
        setShowHistoryModal(true);
    };

    const updateCustomerStatus = (newStatus) => {
        if (!selectedCustomer) return;

        // Define status order for validation if needed, currently allowing flexible movement
        // const steps = ['design', 'production', 'delivery', 'delivered'];

        const confirmMsg =
            newStatus === 'delivered' ? 'هل أنت متأكد من تسليم المشروع نهائياً؟' :
                newStatus === 'delivery' ? 'هل أنت متأكد أن المشروع جاهز للتسليم؟' :
                    'هل تريد تغيير حالة المشروع؟';

        if (window.confirm(confirmMsg)) {
            const updated = { ...selectedCustomer, status: newStatus };
            // Update local state immediately for UI responsiveness
            setSelectedCustomer(updated);
            // Update global state/DB
            updateCustomer(updated);
        }
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        if (!selectedCustomer) return;

        const paymentAmount = parseFloat(paymentData.amount);

        // Record single transaction to physical account with customer reference
        addTransaction({
            type: 'income',
            amount: paymentAmount,
            date: paymentData.date,
            account: selectedCustomer.name, // Use customer name as 'account'
            category: paymentData.category,
            notes: `تحصيل من العميل: ${selectedCustomer.name}`,
            customerName: selectedCustomer.name // Pass customer name for balance update
        });

        // Update selectedCustomer state to reflect new balance immediately
        // PROFIT LOGIC: Payment (income) INCREASES balance (+)
        const newBalance = (selectedCustomer.balance || 0) + paymentAmount;
        setSelectedCustomer({
            ...selectedCustomer,
            balance: newBalance
        });

        setShowPaymentModal(false);
        setPaymentData({
            amount: '',
            date: new Date().toISOString().split('T')[0],
            account: accounts[0]?.name || 'الخزنة الرئيسية',
            category: 'دفعة تعاقد'
        });
        setActiveTab('finances');
    };


    const openCustomerDetails = (customer) => {
        setSelectedCustomer(customer);
        setFormData({ name: customer.name, phone: customer.phone, address: customer.address || '', email: customer.email || '' });
        setShowHistoryModal(true);
        setIsEditing(false);
    };

    const handleEditClick = (e, customer) => {
        if (e) e.stopPropagation();
        setSelectedCustomer(customer);
        setFormData({
            name: customer.name,
            phone: customer.phone,
            address: customer.address || '',
            email: customer.email || '',
            projectType: customer.projectType || 'مطبخ',
            projectCost: customer.projectCost || '',
            status: customer.status || 'design'
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDeleteClick = (e, customer) => {
        e.stopPropagation();
        if (window.confirm(`هل أنت متأكد من حذف العميل ${customer.name}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
            deleteCustomer(customer.id);
        }
    };

    const customerInspections = activeCustomer ? (inspections || []).filter(i => i.customerId === activeCustomer.id) : [];
    const customerPurchases = activeCustomer ? (purchases || []).filter(p => p.customerName === activeCustomer.name) : [];
    const customerTransactions = activeCustomer ? (transactions || []).filter(t =>
        t.customerName === activeCustomer.name ||
        t.account === activeCustomer.name ||
        t.notes?.toString().includes(activeCustomer.name)
    ) : [];

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    const handleExport = () => {
        const dataToExport = filteredCustomers.map(formatters.customer);
        exportToExcel(dataToExport, 'قائمة_العملاء', 'العملاء');
    };

    return (
        <div className="page arabic-text">
            <div className="page-header">
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <Plus size={24} className="text-primary" />
                    <h2>إدارة العملاء</h2>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <button className="btn-export-excel" onClick={handleExport} title="تصدير لإكسل">
                        <FileSpreadsheet size={18} />
                        تصدير البيانات
                    </button>
                    <button
                        className="btn-export-excel"
                        onClick={resetAllCustomerBalances}
                        style={{ background: 'rgba(255, 77, 77, 0.1)', borderColor: 'rgba(255, 77, 77, 0.3)', color: '#ff4d4d' }}
                        title="تصفير أرصدة جميع العملاء"
                    >
                        <Trash2 size={18} />
                        تصفير الأرصدة
                    </button>
                    <button className="btn-premium btn-premium-primary" onClick={() => {
                        setFormData({ name: '', phone: '', address: '', email: '', projectType: 'مطبخ', projectCost: '', status: 'design' });
                        setIsEditing(false);
                        setShowModal(true);
                    }}>
                        <div className="icon-wrapper-premium">
                            <Plus size={20} />
                        </div>
                        <div className="content-premium">
                            <span className="title-premium">إضافة عميل</span>
                            <span className="subtitle-premium">تسجيل بيانات عميل جديد</span>
                        </div>
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div className="header-search-box glass" style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0 15px' }}>
                    <Search size={20} style={{ color: 'var(--text-dim)' }} />
                    <input
                        type="text"
                        placeholder="البحث باسم العميل أو رقم الهاتف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', padding: '12px 10px', outline: 'none' }}
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

            {viewMode === 'grid' ? (
                <div className="grid">
                    {filteredCustomers.map(customer => (
                        <div key={customer.id} className="card glass">
                            <div className="card-header">
                                <div className="customer-avatar">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3>{customer.name}</h3>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <p>{customer.phone}</p>
                                        <span className={`badge ${customer.status === 'delivery' || customer.status === 'delivered' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                                            {customer.status === 'delivery' ? 'في التسليم' :
                                                customer.status === 'delivered' ? 'تم التسليم' :
                                                    customer.status === 'production' ? 'تصنيع' : 'تصميم'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <p><strong>البريد الإلكتروني:</strong> {customer.email}</p>
                                <p><strong>العنوان:</strong> {customer.address}</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center' }}>
                                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>تكلفة المشروع</span>
                                        <span style={{ fontWeight: '700', color: 'white', fontSize: '15px' }}>{(customer.projectCost || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ padding: '8px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
                                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>صافي الربح</span>
                                        <span style={{ fontWeight: '700', color: (customer.balance || 0) >= 0 ? '#2ecc71' : '#ff4d4d' }}>
                                            {(customer.balance || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-footer customer-actions-modern">
                                <button className="btn-icon-action view-btn" onClick={() => openCustomerDetails(customer)}>
                                    <Eye size={18} className="icon-details" />
                                    <span>التفاصيل</span>
                                </button>
                                <button className="btn-icon-action" onClick={(e) => handleEditClick(e, customer)}>
                                    <PencilLine size={18} className="icon-edit" />
                                    <span>تعديل</span>
                                </button>
                                <button className="btn-icon-action delete-btn" onClick={(e) => handleDeleteClick(e, customer)}>
                                    <UserMinus size={18} className="icon-delete" />
                                    <span>حذف</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="modern-table" style={{ width: '100%', color: 'white' }}>
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>الهاتف</th>
                                <th className="text-center">الرصيد</th>
                                <th className="text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id}>
                                    <td>{customer.name}</td>
                                    <td>{customer.phone}</td>
                                    <td className="text-center" style={{ color: (customer.balance || 0) >= 0 ? '#2ecc71' : '#ff4d4d', fontWeight: 'bold' }}>
                                        {(customer.balance || 0).toLocaleString()} <small>ج.م</small>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn-icon-action view-btn" onClick={() => openCustomerDetails(customer)} title="عرض">
                                                <Eye size={16} className="icon-details" />
                                            </button>
                                            <button className="btn-icon-action" onClick={(e) => handleEditClick(e, customer)} title="تعديل">
                                                <PencilLine size={16} className="icon-edit" />
                                            </button>
                                            <button className="btn-icon-action delete-btn" onClick={(e) => handleDeleteClick(e, customer)} title="حذف">
                                                <UserMinus size={16} className="icon-delete" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
            }



            {
                showHistoryModal && selectedCustomer && (
                    <div className="modal-overlay" style={{ zIndex: 1100 }}>
                        <div className="modal glass customer-details-modal">
                            <div className="modal-header">
                                <div className="customer-header-info">
                                    <div className="customer-avatar-large">
                                        {activeCustomer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3>{activeCustomer.name}</h3>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <p className="text-secondary" style={{ margin: 0 }}>{activeCustomer.phone}</p>
                                            <span className={`badge ${activeCustomer.status === 'delivery' || activeCustomer.status === 'delivered' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                                                {activeCustomer.status === 'delivery' ? 'في التسليم' :
                                                    activeCustomer.status === 'delivered' ? 'تم التسليم' :
                                                        activeCustomer.status === 'production' ? 'تصنيع' : 'تصميم'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="header-actions">
                                    <button className="btn-icon-bg" onClick={() => handleEditClick(null, activeCustomer)} title="تعديل البيانات"><PencilLine size={18} /></button>
                                    <button className="btn-icon" onClick={() => setShowHistoryModal(false)}>&times;</button>
                                </div>
                            </div>

                            <div className="customer-tabs">
                                <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                                    <Info size={16} /> <span>البيانات الأساسية</span>
                                </button>
                                <button className={`tab-btn ${activeTab === 'inspections' ? 'active' : ''}`} onClick={() => setActiveTab('inspections')}>
                                    <Search size={16} /> <span>المعاينات</span> <span className="tab-count">{customerInspections.length}</span>
                                </button>
                                <button className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>
                                    <ShoppingCart size={16} /> <span>المشتريات</span> <span className="tab-count">{customerPurchases.length}</span>
                                </button>
                                <button className={`tab-btn ${activeTab === 'finances' ? 'active' : ''}`} onClick={() => setActiveTab('finances')}>
                                    <CreditCard size={16} /> <span>الحسابات</span> <span className="tab-count">{customerTransactions.length}</span>
                                </button>
                            </div>

                            <div className="tab-content-scroller">
                                {activeTab === 'info' && (
                                    <div className="tab-pane info-grid">
                                        <div className="info-item">
                                            <label>رقم الهاتف</label>
                                            <p>{activeCustomer.phone}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>البريد الإلكتروني</label>
                                            <p>{activeCustomer.email || 'غير مسجل'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>العنوان</label>
                                            <p>{activeCustomer.address || 'غير مسجل'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>نوع المشروع</label>
                                            <p>{activeCustomer.projectType || 'مطبخ'}</p>
                                        </div>

                                        {/* Status Stepper */}
                                        <div className="status-stepper glass-panel" style={{ margin: '15px 0', padding: '15px', borderRadius: '12px', gridColumn: 'span 2' }}>
                                            <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>مراحل المشروع</h4>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                                                {/* Progress Line */}
                                                <div style={{ position: 'absolute', top: '12px', left: '0', right: '0', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
                                                <div style={{
                                                    position: 'absolute', top: '12px', right: '0', height: '2px', background: 'var(--primary)', zIndex: 0,
                                                    width: activeCustomer.status === 'delivered' ? '100%' :
                                                        activeCustomer.status === 'delivery' ? '75%' :
                                                            activeCustomer.status === 'production' ? '50%' : '25%'
                                                }}></div>

                                                {[
                                                    { id: 'design', label: 'تصميم', icon: <Edit size={14} /> },
                                                    { id: 'production', label: 'تصنيع', icon: <Settings size={14} /> },
                                                    { id: 'delivery', label: 'تسليم', icon: <Truck size={14} /> },
                                                    { id: 'delivered', label: 'منتهي', icon: <CheckCircle size={14} /> }
                                                ].map((step, idx) => {
                                                    const steps = ['design', 'production', 'delivery', 'delivered'];
                                                    const currentIdx = steps.indexOf(activeCustomer.status || 'design');
                                                    const stepIdx = steps.indexOf(step.id);
                                                    const isActive = stepIdx <= currentIdx;
                                                    const isCurrent = step.id === (activeCustomer.status || 'design');

                                                    return (
                                                        <div
                                                            key={step.id}
                                                            onClick={() => updateCustomerStatus(step.id)}
                                                            style={{
                                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, position: 'relative', cursor: 'pointer'
                                                            }}
                                                            title={`تغيير الحالة إلى ${step.label}`}
                                                        >
                                                            <div style={{
                                                                width: '32px', height: '32px', borderRadius: '50%',
                                                                background: isActive ? 'var(--primary)' : '#1a1a1a',
                                                                border: isCurrent ? '2px solid white' : `2px solid ${isActive ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                color: isActive ? 'white' : 'var(--text-dim)',
                                                                transition: 'all 0.3s ease',
                                                                boxShadow: isCurrent ? '0 0 10px rgba(var(--primary-rgb), 0.5)' : 'none'
                                                            }}>
                                                                {step.icon}
                                                            </div>
                                                            <span style={{ fontSize: '11px', color: isActive ? 'white' : 'var(--text-dim)', fontWeight: isActive ? 'bold' : 'normal' }}>{step.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>



                                        {/* Financial Summary Calculation */}
                                        {(() => {
                                            const totalIncome = customerTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
                                            const totalExpenses = customerTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
                                            // Ensure we use the actual customer balance from DB to match the "outside" card view
                                            const calculatedProfit = totalIncome - totalExpenses;
                                            const storedProfit = activeCustomer.balance !== undefined ? activeCustomer.balance : calculatedProfit;

                                            // Check for mismatch
                                            const isMismatch = Math.abs(calculatedProfit - storedProfit) > 1;

                                            return (
                                                <div className="stats-grid-modern" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '15px', gridColumn: 'span 2' }}>
                                                    {/* Row 1: Budget and Profit */}
                                                    <div className="stat-box glass-panel" style={{ padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>ميزانية المشروع</span>
                                                        <span style={{ fontSize: '18px', fontWeight: '800', color: 'white', fontFamily: 'monospace' }}>
                                                            {(activeCustomer.projectCost || 0).toLocaleString()} <small style={{ fontSize: '10px', fontWeight: 'normal' }}>ج.م</small>
                                                        </span>
                                                    </div>

                                                    <div className="stat-box glass-panel" style={{ padding: '15px', borderRadius: '12px', textAlign: 'center', background: storedProfit >= 0 ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255, 77, 77, 0.1)', border: storedProfit >= 0 ? '1px solid rgba(46, 204, 113, 0.2)' : '1px solid rgba(255, 77, 77, 0.2)', position: 'relative' }}>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>صافي الربح</span>
                                                        <span style={{ fontSize: '18px', fontWeight: '800', color: storedProfit >= 0 ? '#2ecc71' : '#ff4d4d', fontFamily: 'monospace' }}>
                                                            {storedProfit.toLocaleString()} <small style={{ fontSize: '10px', fontWeight: 'normal' }}>ج.م</small>
                                                        </span>
                                                        {isMismatch && (
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm(`يوجد اختلاف بين الرصيد المسجل (${storedProfit}) والرصيد المحسوب من المعاملات (${calculatedProfit}).\nهل تريد تصحيح الرصيد ليكون ${calculatedProfit}؟`)) {
                                                                        updateCustomer({ ...activeCustomer, balance: calculatedProfit });
                                                                    }
                                                                }}
                                                                title="تصحيح الرصيد (يوجد اختلاف)"
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '5px',
                                                                    right: '5px',
                                                                    background: 'rgba(255, 193, 7, 0.2)',
                                                                    color: '#ffc107',
                                                                    border: '1px solid #ffc107',
                                                                    borderRadius: '50%',
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    cursor: 'pointer',
                                                                    fontSize: '10px'
                                                                }}
                                                            >
                                                                !
                                                            </button>
                                                        )}
                                                    </div>


                                                    {/* Row 2: Income and Expenses */}
                                                    <div className="stat-box glass-panel" style={{ padding: '12px', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block' }}>إجمالي المدفوعات (من العميل)</span>
                                                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#2ecc71', fontFamily: 'monospace' }}>
                                                            + {totalIncome.toLocaleString()}
                                                        </span>
                                                    </div>

                                                    <div className="stat-box glass-panel" style={{ padding: '12px', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block' }}>إجمالي المصروفات (على المشروع)</span>
                                                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#ff4d4d', fontFamily: 'monospace' }}>
                                                            - {totalExpenses.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                        <div style={{ marginTop: '20px', gridColumn: 'span 2' }}>
                                            <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>إجراءات سريعة</h4>
                                            <div className="quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%' }}>
                                                <button
                                                    className="action-card glass-interactive"
                                                    onClick={() => { setShowPurchaseModal(true); }}
                                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', transition: 'all 0.2s', width: '100%' }}
                                                >
                                                    <div style={{ background: 'rgba(230, 126, 34, 0.15)', padding: '10px', borderRadius: '50%', color: '#e67e22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <ShoppingCart size={20} />
                                                    </div>
                                                    <span style={{ fontSize: '12px', fontWeight: '600' }}>تسجيل مصروفات</span>
                                                </button>
                                                <button
                                                    className="action-card glass-interactive"
                                                    onClick={() => { setShowPaymentModal(true); }}
                                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', transition: 'all 0.2s', width: '100%' }}
                                                >
                                                    <div style={{ background: 'rgba(46, 204, 113, 0.15)', padding: '10px', borderRadius: '50%', color: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <DollarSign size={20} />
                                                    </div>
                                                    <span style={{ fontSize: '12px', fontWeight: '600' }}>تحصيل دفعة</span>
                                                </button>
                                                <button
                                                    className="action-card glass-interactive"
                                                    onClick={() => handleAddInspection(selectedCustomer, 'kitchen')}
                                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', transition: 'all 0.2s', width: '100%' }}
                                                >
                                                    <div style={{ background: 'rgba(155, 89, 182, 0.15)', padding: '10px', borderRadius: '50%', color: '#9b59b6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Search size={20} />
                                                    </div>
                                                    <span style={{ fontSize: '12px', fontWeight: '600' }}>حجز معاينة</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'inspections' && (
                                    <div className="tab-pane">
                                        <div className="history-list-modern">
                                            {customerInspections.map(ins => (
                                                <div key={ins.id} className="history-item-modern inspection-item">
                                                    <div className="item-main">
                                                        <div className={`inspection-type-icon ${ins.type}`}>
                                                            {ins.type === 'kitchen' ? <Search size={18} /> : <Package size={18} />}
                                                        </div>
                                                        <div>
                                                            <span className="item-title">معاينة {ins.type === 'kitchen' ? 'مطبخ' : 'درسينج'}</span>
                                                            <span className="item-date">{new Date(ins.date).toLocaleDateString('ar-EG')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="item-actions">
                                                        <span className="representative-tag">{ins.representative || 'بدون مهندس'}</span>
                                                        <button className="btn-text" onClick={() => alert('قريباً: عرض ملف المعاينة كاملاً')}>عرض</button>
                                                    </div>
                                                </div>
                                            ))}
                                            {customerInspections.length === 0 && <div className="empty-state-min"><p>لا توجد معاينات مسجلة</p></div>}
                                        </div>
                                    </div>
                                )}


                                {activeTab === 'purchases' && (
                                    <div className="tab-pane">
                                        <div className="history-list-modern">
                                            {Object.entries(
                                                customerPurchases.reduce((groups, item) => {
                                                    const key = item.serialNumber || item.id;
                                                    if (!groups[key]) groups[key] = [];
                                                    groups[key].push(item);
                                                    return groups;
                                                }, {})
                                            ).sort((a, b) => new Date(b[1][0].date) - new Date(a[1][0].date))
                                                .map(([key, items]) => {
                                                    const isGroup = items.length > 1 || (items[0].serialNumber && items[0].serialNumber.startsWith('PO-'));
                                                    const totalGroup = items.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unitPrice)), 0);
                                                    const date = new Date(items[0].date).toLocaleDateString('ar-EG');

                                                    if (isGroup) {
                                                        return (
                                                            <div key={key} className="history-item-modern inspection-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
                                                                <div className="item-main" style={{ justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '5px' }}>
                                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                                        <div className="inspection-type-icon kitchen" style={{ background: 'rgba(230, 126, 34, 0.1)', color: '#e67e22' }}>
                                                                            <ShoppingCart size={18} />
                                                                        </div>
                                                                        <div>
                                                                            <span className="item-title">طلب توريد / خدمات ({items.length} بنود)</span>
                                                                            <span className="item-date">{date} <span style={{ opacity: 0.5 }}>#{key.slice(-6)}</span></span>
                                                                        </div>
                                                                    </div>
                                                                    <span className="item-amount" style={{ color: '#e67e22' }}>{(totalGroup).toLocaleString()} ج.م</span>
                                                                </div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                    {items.map((subItem, idx) => (
                                                                        <div key={subItem.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', alignItems: 'center' }}>
                                                                            <span style={{ color: 'var(--text-secondary)' }}>{idx + 1}. {subItem.materialName}</span>
                                                                            <span style={{ fontWeight: '600' }}>{(Number(subItem.quantity) * Number(subItem.unitPrice)).toLocaleString()}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    } else {
                                                        const p = items[0];
                                                        return (
                                                            <div key={p.id} className="history-item-modern interactive" onDoubleClick={() => handlePurchaseItemDoubleClick(p)} title="اضغط مرتين للتفاصيل">
                                                                <div className="item-main">
                                                                    <Package size={18} className="text-secondary" />
                                                                    <div>
                                                                        <span className="item-title">{p.materialName} ({p.quantity})</span>
                                                                        <span className="item-date">{date}</span>
                                                                    </div>
                                                                </div>
                                                                <span className="item-amount">{(Number(p.total) || 0).toLocaleString()} ج.م</span>
                                                            </div>
                                                        );
                                                    }
                                                })}
                                            {customerPurchases.length === 0 && <div className="empty-state-min"><p>لا توجد مشتريات مسجلة</p></div>}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'finances' && (
                                    <div className="tab-pane">
                                        <div className="history-list-modern">
                                            {customerTransactions.map(t => (
                                                <div key={t.id || Math.random()} className="history-item-modern">
                                                    <div className="item-main">
                                                        <DollarSign size={18} className={t.type === 'income' ? 'text-success' : 'text-danger'} />
                                                        <div>
                                                            <span className="item-title">{t.category}</span>
                                                            <span className="item-date">{new Date(t.date).toLocaleDateString('ar-EG')}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <span className={`item-amount ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                                            {t.type === 'income' ? '+' : '-'}{(Number(t.amount) || 0).toLocaleString()}
                                                        </span>
                                                        <button
                                                            className="btn-icon-action delete-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm('⚠️ حذف هذه المعاملة سيؤدي لتعديل رصيد العميل تلقائياً.\nهل أنت متأكد من الحذف؟')) {
                                                                    deleteTransaction(t.id);
                                                                }
                                                            }}
                                                            title="حذف المعاملة"
                                                            style={{ padding: '4px', width: '28px', height: '28px' }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {customerTransactions.length === 0 && <div className="empty-state-min"><p>لا توجد عمليات مالية</p></div>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions-sticky">
                                <button className="btn-secondary" onClick={() => setShowHistoryModal(false)}>إغلاق</button>
                            </div>
                        </div>
                    </div>
                )
            }


            {/* Purchase Details Modal */}
            {
                showPurchaseDetails && selectedPurchaseItem && (
                    <div className="modal-overlay edit-modal-overlay" style={{ zIndex: 9999 }}>
                        <div className="modal glass" style={{ maxWidth: '500px' }}>
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '24px' }}>{(Number(selectedPurchaseItem.total) || 0).toLocaleString()} ج.م</h2>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', flexDirection: 'row-reverse' }}>
                                        {selectedPurchaseItem.materialName} <span style={{ fontSize: '14px', opacity: 0.7 }}>({selectedPurchaseItem.quantity})</span>
                                        <Package size={20} />
                                    </h3>
                                    <p style={{ margin: '5px 0 0', opacity: 0.6, fontSize: '12px' }}>{new Date(selectedPurchaseItem.date).toLocaleDateString('ar-EG')}</p>
                                </div>
                            </div>

                            <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
                                <button className="btn-secondary" onClick={() => setShowPurchaseDetails(false)}>إغلاق</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showPurchaseModal && selectedCustomer && (
                    <div className="modal-overlay edit-modal-overlay" style={{ zIndex: 9999 }}>
                        <div className="modal glass" style={{ maxWidth: '700px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <ShoppingCart className="text-primary" />
                                <h3>إضافة بنود / خدمات للعميل: {selectedCustomer.name}</h3>
                            </div>
                            <form onSubmit={handlePurchaseSubmit}>
                                {/* Top Section: Supplier Info */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    marginBottom: '20px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                            <Truck size={14} /> اسم المورد (اختياري)
                                        </label>
                                        <input
                                            type="text"
                                            value={purchaseData.supplier}
                                            onChange={e => setPurchaseData({ ...purchaseData, supplier: e.target.value })}
                                            placeholder="أدخل اسم المورد..."
                                            className="glass-input"
                                            style={{
                                                background: 'rgba(0,0,0,0.2)',
                                                border: '1px solid var(--border-glass)',
                                                borderRadius: '8px',
                                                padding: '10px',
                                                color: 'white',
                                                width: '100%',
                                                marginTop: '8px'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '40px 2fr 1fr 40px',
                                    gap: '12px',
                                    marginBottom: '10px',
                                    padding: '0 10px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <span>#</span>
                                    <span>الصنف / البند</span>
                                    <span>السعر</span>
                                    <span></span>
                                </div>

                                {/* Items List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                    {purchaseData.items.map((item, index) => (
                                        <div key={index} style={{
                                            display: 'grid',
                                            gridTemplateColumns: '40px 2fr 1fr 40px',
                                            gap: '12px',
                                            alignItems: 'center',
                                            padding: '12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            transition: 'all 0.2s'
                                        }} className="purchase-row">
                                            <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>{index + 1}</span>

                                            <input
                                                required
                                                type="text"
                                                value={item.serviceName}
                                                onChange={e => {
                                                    const newItems = [...purchaseData.items];
                                                    newItems[index].serviceName = e.target.value;
                                                    setPurchaseData({ ...purchaseData, items: newItems });
                                                }}
                                                placeholder="اسم الصنف..."
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                                    color: 'white',
                                                    padding: '8px',
                                                    width: '100%'
                                                }}
                                            />

                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                value={item.price}
                                                onChange={e => {
                                                    const newItems = [...purchaseData.items];
                                                    newItems[index].price = e.target.value;
                                                    setPurchaseData({ ...purchaseData, items: newItems });
                                                }}
                                                placeholder="0.00"
                                                style={{
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    color: 'white',
                                                    padding: '8px',
                                                    width: '100%',
                                                    textAlign: 'center'
                                                }}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (purchaseData.items.length > 1) {
                                                        const newItems = purchaseData.items.filter((_, i) => i !== index);
                                                        setPurchaseData({ ...purchaseData, items: newItems });
                                                    }
                                                }}
                                                disabled={purchaseData.items.length === 1}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: purchaseData.items.length === 1 ? 'var(--text-dim)' : '#ff4d4d',
                                                    cursor: purchaseData.items.length === 1 ? 'default' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setPurchaseData({
                                            ...purchaseData,
                                            items: [...purchaseData.items, { serviceName: '', price: '' }]
                                        });
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(var(--primary-rgb), 0.1)',
                                        border: '1px dashed rgba(var(--primary-rgb), 0.3)',
                                        borderRadius: '10px',
                                        color: 'var(--primary)',
                                        cursor: 'pointer',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }}
                                    className="hover-bright"
                                >
                                    <Plus size={18} /> إضافة بند جديد
                                </button>

                                <div className="info-box glass-panel" style={{
                                    padding: '20px',
                                    borderRadius: '16px',
                                    marginBottom: '20px',
                                    border: '1px solid rgba(var(--primary-rgb), 0.2)',
                                    background: 'rgba(var(--primary-rgb), 0.05)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <ShoppingCart size={20} className="text-primary" />
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>إجمالي الفاتورة النهائية</span>
                                        </div>
                                        <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '24px', fontFamily: 'monospace' }}>
                                            {purchaseData.items.reduce((sum, item) =>
                                                sum + ((Number(item.quantity) || 1) * (Number(item.price) || 0)), 0
                                            ).toLocaleString()} ج.م
                                        </span>
                                    </div>
                                    <p className="text-secondary" style={{ fontSize: '11px', margin: 0, textAlign: 'right' }}>
                                        * هذه القيمة ستخصم من رصيد أرباح العميل
                                    </p>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowPurchaseModal(false)}>إلغاء</button>
                                    <button type="submit" className="btn-primary" style={{ minWidth: '200px' }}>
                                        <Package size={18} style={{ marginLeft: '8px' }} />
                                        تسجيل وإضافة ({purchaseData.items.length} بنود)
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                showInspectionModal && selectedCustomer && (
                    <div className="modal-overlay edit-modal-overlay" style={{ zIndex: 9999 }}>
                        <div className="modal glass" style={{ maxWidth: '800px', width: '95%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '0 20px' }}>
                                <Search className="text-primary" />
                                <h3>نموذج معاينة جديد ({inspectionType === 'kitchen' ? 'مطبخ' : 'درسينج'}) - {selectedCustomer.name}</h3>
                            </div>
                            <InspectionForm
                                customer={selectedCustomer}
                                type={inspectionType}
                                onCancel={() => setShowInspectionModal(false)}
                                onSubmit={handleInspectionSubmit}
                            />
                        </div>
                    </div>
                )
            }

            {
                showPaymentModal && selectedCustomer && (
                    <div className="modal-overlay edit-modal-overlay" style={{ zIndex: 9999 }}>
                        <div className="modal glass" style={{ maxWidth: '450px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <DollarSign className="text-primary" />
                                <h3>تحصيل دفعة جديدة: {selectedCustomer.name}</h3>
                            </div>
                            <form onSubmit={handlePaymentSubmit}>
                                <div className="form-group">
                                    <label>المبلغ (ج.م)</label>
                                    <input
                                        required
                                        type="number"
                                        value={paymentData.amount}
                                        onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })}
                                        placeholder="0.00"
                                        style={{ fontSize: '18px', fontWeight: 'bold' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>تاريخ التحصيل</label>
                                    <input
                                        required
                                        type="date"
                                        value={paymentData.date}
                                        onChange={e => setPaymentData({ ...paymentData, date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>تصنيف الدفعة</label>
                                    <select
                                        value={paymentData.category}
                                        onChange={e => setPaymentData({ ...paymentData, category: e.target.value })}
                                    >
                                        <option value="دفعة تعاقد">دفعة تعاقد</option>
                                        <option value="دفعة قياسات">دفعة قياسات</option>
                                        <option value="دفعة توريد">دفعة توريد</option>
                                        <option value="دفعة استلام">دفعة استلام</option>
                                        <option value="أخرى">أخرى</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <small style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', display: 'block' }}>
                                        💡 سيتم إضافة المبلغ لرصيد العميل فقط (دون التأثير على الخزينة)
                                    </small>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)}>إلغاء</button>
                                    <button type="submit" className="btn-primary">تحصيل الآن</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                showModal && (
                    <div className="modal-overlay edit-modal-overlay" style={{ zIndex: 10000, position: 'fixed' }}>
                        <div className="modal glass">
                            <h3>{isEditing ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>الاسم الكامل</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>رقم الهاتف</label>
                                    <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>البريد الإلكتروني</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>العنوان</label>
                                    <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>تكلفة المشروع (الميزانية التقديرية)</label>
                                    <input
                                        type="number"
                                        value={formData.projectCost}
                                        onChange={e => setFormData({ ...formData, projectCost: e.target.value })}
                                        placeholder="0.00"
                                        style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary)' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>نوع المشروع</label>
                                    <input
                                        type="text"
                                        list="project-types"
                                        value={formData.projectType}
                                        onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                                        placeholder="ادخل نوع المشروع أو اختر من القائمة..."
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--border-glass)',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                    <datalist id="project-types">
                                        {contractOptions.projectTypes?.map(type => <option key={type} value={type} />)}
                                    </datalist>
                                </div>
                                <div className="form-group">
                                    <label>حالة المشروع</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--border-glass)',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="design">مرحلة التصميم</option>
                                        <option value="production">مرحلة التصنيع</option>
                                        <option value="delivery">جاهز للتسليم (في التسليم)</option>
                                        <option value="delivered">تم التسليم النهائي</option>
                                        <option value="cancelled">ملغي</option>
                                    </select>
                                    {(formData.status === 'delivery' || formData.status === 'delivered') &&
                                        <p style={{ fontSize: '11px', color: '#2ecc71', marginTop: '5px' }}>
                                            * سيظهر هذا المشروع في شاشة "التسليمات"
                                        </p>
                                    }
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>إلغاء</button>
                                    <button type="submit" className="btn-primary">حفظ العميل</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            <style>{`
                .customer-details-modal {
                    max-width: 850px;
                    width: 95%;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .customer-details-modal .modal-header {
                    padding: 25px;
                    background: rgba(var(--primary-rgb), 0.05);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .customer-header-info {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }
                .customer-avatar-large {
                    width: 60px;
                    height: 60px;
                    border-radius: 15px;
                    background: var(--primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    font-weight: 800;
                    box-shadow: 0 8px 16px rgba(var(--primary-rgb), 0.3);
                }
                .header-actions {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                .btn-icon-bg {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-icon-bg:hover {
                    background: var(--primary);
                    transform: scale(1.05);
                }
                .customer-tabs {
                    display: flex;
                    gap: 5px;
                    padding: 10px 20px;
                    background: rgba(255,255,255,0.02);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .tab-btn {
                    padding: 10px 18px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .tab-btn:hover {
                    color: white;
                    background: rgba(255,255,255,0.05);
                }
                .tab-btn.active {
                    color: var(--primary);
                    background: rgba(var(--primary-rgb), 0.1);
                }
                .tab-content-scroller {
                    max-height: 60vh;
                    overflow-y: auto;
                    padding: 25px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .info-item {
                    background: rgba(255,255,255,0.02);
                    padding: 15px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .info-item.full-width { grid-column: span 2; }
                .info-item label {
                    display: block;
                    font-size: 12px;
                    color: var(--text-secondary);
                    margin-bottom: 6px;
                }
                .info-item p {
                    font-size: 16px;
                    font-weight: 500;
                    color: white;
                }
                .balance-card {
                    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.2), rgba(var(--primary-rgb), 0.05));
                    border-color: rgba(var(--primary-rgb), 0.3);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .balance-value {
                    font-size: 32px;
                    font-weight: 800;
                    color: var(--primary);
                    margin-top: 5px;
                }
                .balance-value span { font-size: 14px; margin-right: 5px; }
                
                .quick-actions-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                .action-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    padding: 20px;
                    border-radius: 15px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                    color: white;
                }
                .action-card:hover {
                    background: rgba(var(--primary-rgb), 0.1);
                    border-color: var(--primary);
                    transform: translateY(-3px);
                }
                .action-card span { font-weight: 600; font-size: 14px; }

                .history-list-modern {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .history-item-modern {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 10px;
                }
                .item-main {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                .item-title { display: block; font-weight: 600; font-size: 14px; margin-bottom: 2px; }
                .item-date { font-size: 11px; color: var(--text-secondary); }
                .item-amount { font-weight: 700; font-size: 15px; }
                .btn-text {
                    background: transparent;
                    border: none;
                    color: var(--primary);
                    font-weight: 600;
                    cursor: pointer;
                }
                .empty-state-min {
                    text-align: center;
                    padding: 50px;
                    color: var(--text-secondary);
                }
                .modal-actions-sticky {
                    padding: 20px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    justify-content: flex-end;
                }
                .text-danger { color: #ff4d4d !important; }
                .edit-modal-overlay { z-index: 9999 !important; }
                .btn-inspection-kitchen:hover { border-color: var(--primary) !important; color: var(--primary) !important; }
                .btn-inspection-dressing:hover { border-color: #e91e63 !important; color: #e91e63 !important; }
                
                .inspection-item { border-right: 4px solid var(--primary); }
                .inspection-type-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .inspection-type-icon.kitchen { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); }
                .inspection-type-icon.dressing { background: rgba(233, 30, 99, 0.1); color: #e91e63; }
                
                .item-actions { display: flex; align-items: center; gap: 15px; }
                .representative-tag {
                    font-size: 11px;
                    padding: 2px 8px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 4px;
                    color: var(--text-secondary);
                }

                :root {
                    --primary-rgb: 70, 174, 76;
                }
                .customer-actions-modern {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    padding: 15px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }
                @media (max-width: 480px) {
                    .customer-actions-modern {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                .customer-actions-modern button {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 12px 5px;
                    border-radius: 14px;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.03);
                    color: white;
                    width: 100% !important;
                    height: auto !important;
                    min-height: 70px;
                }
                .customer-actions-modern button span {
                    display: block;
                    width: 100%;
                    text-align: center;
                }
                .customer-actions-modern button:hover {
                    transform: translateY(-2px);
                    background: rgba(255,255,255,0.08);
                    border-color: rgba(255,255,255,0.2);
                }
                .customer-actions-modern .view-btn:hover {
                    color: var(--primary);
                    border-color: rgba(70, 174, 92, 0.3);
                    background: rgba(70, 174, 92, 0.1);
                }
                /* Edit button */
                .customer-actions-modern button:nth-child(2):hover {
                    color: #ffaa00;
                    border-color: rgba(255, 170, 0, 0.3);
                    background: rgba(255, 170, 0, 0.1);
                }
                .customer-actions-modern .delete-btn:hover {
                    color: #ff4d4d;
                    border-color: rgba(255, 77, 77, 0.3);
                    background: rgba(255, 77, 77, 0.1);
                }
                .icon-details { color: var(--primary); opacity: 0.9; }
                .icon-edit { color: #ffaa00; opacity: 0.9; }
                .icon-delete { color: #ff4d4d; opacity: 0.9; }
                
                .customer-tabs {
                    display: flex;
                    gap: 8px;
                    padding: 6px;
                    margin: 0 20px 24px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 254, 254, 0.05);
                    border-radius: 14px;
                    overflow-x: auto;
                    scrollbar-width: none;
                }
                .customer-tabs::-webkit-scrollbar { display: none; }
                
                .tab-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 10px 18px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 13px;
                    font-weight: 600;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                    flex: 1;
                }
                
                .tab-btn:hover {
                    color: white;
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .tab-btn.active {
                    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.25), rgba(var(--primary-rgb), 0.1));
                    color: var(--primary);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(var(--primary-rgb), 0.2);
                }
                
                .tab-btn svg {
                    opacity: 0.7;
                    transition: transform 0.3s ease;
                }
                
                .tab-btn.active svg {
                    opacity: 1;
                    transform: scale(1.1);
                    color: var(--primary);
                }
                
                .tab-count {
                    padding: 3px 8px;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 700;
                    transition: all 0.3s ease;
                }
                
                .tab-btn.active .tab-count {
                    background: rgba(var(--primary-rgb), 0.25);
                    color: var(--primary);
                }
                
                .customer-actions-modern span {
                    white-space: nowrap;
                }
                
                .modal-header {
                    padding: 24px 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                }
                
                .customer-header-info {
                    display: flex;
                    gap: 18px;
                    align-items: center;
                }
                
                .customer-avatar-large {
                    width: 54px;
                    height: 54px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, var(--primary), #d4a017);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    font-weight: 800;
                    box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.3);
                }
            `}</style>
        </div >
    );
};

export default Customers;
