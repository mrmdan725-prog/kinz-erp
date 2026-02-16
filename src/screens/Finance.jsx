import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Plus,
    Search,
    Filter,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    PieChart,
    Edit,
    Trash2,
    Settings as SettingsIcon,
    X,
    Users,
    ExternalLink,
    FileSpreadsheet,
    LayoutGrid,
    List,
    FileText
} from 'lucide-react';
import { exportToExcel, formatters } from '../utils/excelExport';

const Finance = () => {
    const {
        transactions,
        accounts,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        adjustAccountBalance,
        resetAllAccounts,
        resetAllCustomerBalances,
        recurringExpenses,
        addRecurring,
        deleteRecurring,
        processRecurring,
        customers,
        systemSettings,
        adjustCustomerBalance
    } = useApp();
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showRecurringModal, setShowRecurringModal] = useState(false);
    const [showStatementModal, setShowStatementModal] = useState(false);
    const [accountEditMode, setAccountEditMode] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedAccountForStatement, setSelectedAccountForStatement] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('general'); // 'general', 'workshop', 'customers'
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
    const [addModalTab, setAddModalTab] = useState('customer'); // 'customer' or 'workshop'

    const [newAdjustment, setNewAdjustment] = useState({
        newBalance: '',
        reason: ''
    });

    // Handle initial tab from location state
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        } else {
            setActiveTab('general');
        }
    }, [location.state?.tab]);

    const [newRecurring, setNewRecurring] = useState({
        label: '',
        amount: '',
        category: 'مصاريف معرض',
        account: accounts[0]?.name || 'الخزنة الرئيسية'
    });
    const [newTransaction, setNewTransaction] = useState({
        amount: '',
        type: 'income',
        category: 'دفعة تعاقد',
        account: accounts[0]?.name || 'الخزنة الرئيسية',
        notes: ''
    });
    const [newAccount, setNewAccount] = useState({ name: '', balance: '' });
    const [transactionEditMode, setTransactionEditMode] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [customerFilter, setCustomerFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Calculate Total Stats (Including Customers & Workshop)
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const netProfit = totalIncome - totalExpense;

    // Expense Categories Analysis
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    const categoriesAnalysis = [
        { key: 'خامات', label: 'خامات', color: 'var(--primary)' },
        { key: 'رواتب', label: 'رواتب', color: '#36a2eb' },
        { key: 'مصاريف معرض', label: 'مصاريف معرض', color: '#ff6384' },
        { key: 'أخرى', label: 'أخرى', color: '#ffcc00' }
    ].map(cat => {
        const amount = expenseTransactions
            .filter(t => cat.key === 'أخرى'
                ? !['خامات', 'رواتب', 'مصاريف معرض'].includes(t.category)
                : t.category.includes(cat.key))
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return { ...cat, amount, percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0 };
    });

    const mainCategory = categoriesAnalysis.reduce((prev, current) => (prev.amount > current.amount) ? prev : current);

    // Conic Gradient String for the chart
    let currentTotal = 0;
    const gradientParts = categoriesAnalysis.map(cat => {
        const start = currentTotal;
        currentTotal += cat.percentage;
        return `${cat.color} ${start}% ${currentTotal}%`;
    }).join(', ');
    const chartBackground = `conic-gradient(${gradientParts})`;

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;

        let matchesDate = true;
        if (dateRange.start || dateRange.end) {
            const tDate = new Date(t.date).getTime();
            if (dateRange.start) {
                const start = new Date(dateRange.start).getTime();
                if (tDate < start) matchesDate = false;
            }
            if (dateRange.end) {
                const end = new Date(dateRange.end).getTime();
                // Add 23:59:59 to include the whole end day
                if (tDate > (end + 86399999)) matchesDate = false;
            }
        }

        let matchesCustomer = true;
        if (customerFilter !== 'all') {
            matchesCustomer = t.customerName === customerFilter || t.account === customerFilter;
        }

        return matchesSearch && matchesType && matchesDate && matchesCustomer;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (transactionEditMode && selectedTransaction) {
            updateTransaction({ ...selectedTransaction, ...newTransaction });
        } else {
            addTransaction(newTransaction);
        }
        setShowAddModal(false);
        setTransactionEditMode(false);
        setSelectedTransaction(null);
        setNewTransaction({
            amount: '',
            type: 'income',
            category: 'دفعة تعاقد',
            account: accounts[0]?.name || 'الخزنة الرئيسية',
            notes: ''
        });
    };

    const startEditTransaction = (t) => {
        setSelectedTransaction(t);
        setNewTransaction({
            amount: t.amount,
            type: t.type,
            category: t.category,
            account: t.account,
            notes: t.notes
        });
        setTransactionEditMode(true);
        setShowAddModal(true);
    };
    const confirmDeleteTransaction = () => {
        if (transactionToDelete) {
            deleteTransaction(transactionToDelete.id);
            setTransactionToDelete(null);
        }
    };

    const handleProcessRecurring = (id) => {
        processRecurring(id);
    };

    const handleRecurringSubmit = (e) => {
        e.preventDefault();
        addRecurring(newRecurring);
        setShowRecurringModal(false);
        setNewRecurring({
            label: '',
            amount: '',
            category: 'مصاريف معرض',
            account: accounts[0]?.name || 'الخزنة الرئيسية'
        });
    };

    const handleAdjustment = (e) => {
        e.preventDefault();
        const newBal = parseFloat(newAdjustment.newBalance);

        if (selectedAccountForStatement.phone) {
            // It's a customer
            adjustCustomerBalance(selectedAccountForStatement.id, newBal, newAdjustment.reason);
        } else {
            // It's a standard account
            adjustAccountBalance(selectedAccountForStatement.id, newBal, newAdjustment.reason);
        }

        setShowStatementModal(false);
        setNewAdjustment({ newBalance: '', reason: '' });
    };

    const openStatement = (acc) => {
        setSelectedAccountForStatement(acc);
        setShowStatementModal(true);
    };

    const accountTransactions = selectedAccountForStatement
        ? transactions.filter(t => t.account === selectedAccountForStatement.name || t.customerName === selectedAccountForStatement.name)
        : [];

    const handleAccountSubmit = (e) => {
        e.preventDefault();
        if (accountEditMode && selectedAccount) {
            updateAccount({ ...selectedAccount, ...newAccount });
        } else {
            addAccount(newAccount);
        }
        setShowAccountModal(false);
        setAccountEditMode(false);
        setSelectedAccount(null);
        setNewAccount({ name: '', balance: '' });
    };

    const startEditAccount = (acc) => {
        setSelectedAccount(acc);
        setNewAccount({ name: acc.name, balance: acc.balance });
        setAccountEditMode(true);
        setShowAccountModal(true);
    };

    const handleExport = () => {
        const dataToExport = filteredTransactions.map(formatters.transaction);
        exportToExcel(dataToExport, 'العمليات_المالية', 'المعاملات');
    };

    return (
        <div className="page dashboard-fade-in">
            <div className="module-header">
                <div className="module-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <div className="legendary-icon-container" style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
                            <TrendingUp size={24} color="white" />
                        </div>
                        <h1 style={{ fontSize: '24px' }}>المالية والمحاسبة</h1>
                    </div>
                    <p>إدارة الحسابات، التدفقات النقدية والتقارير المالية باحترافية.</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                        <div className="header-search-box" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <Search size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                            <input
                                type="text"
                                placeholder="بحث في العمليات..."
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

                <div className="module-actions" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button className="btn-export-excel glass-interactive" onClick={handleExport}>
                        <FileSpreadsheet size={16} />
                        تصدير البيانات
                    </button>

                    <button className="btn-premium btn-premium-primary" onClick={() => { setAddModalTab('customer'); setShowAddModal(true); }}>
                        <div className="icon-wrapper-premium">
                            <Plus size={20} />
                        </div>
                        <div className="content-premium">
                            <span className="title-premium">إضافة حركة مالية</span>
                            <span className="subtitle-premium">تحصيل من عميل أو صرف للورشة</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="finance-tabs-wrapper glass" style={{ marginBottom: '32px', padding: '8px', borderRadius: '16px', display: 'flex', gap: '10px' }}>
                <button
                    className={`finance-tab ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    <Wallet size={18} />
                    الخزنة والمصروفات العامة
                </button>
                <button
                    className={`finance-tab ${activeTab === 'customers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('customers')}
                >
                    <Users size={18} />
                    حسابات العملاء
                </button>
            </div>

            {activeTab === 'general' && (
                <div className="dashboard-fade-in">
                    {/* Financial Stats */}
                    <div className="stats-grid finance-stats" style={{ marginBottom: '32px' }}>
                        <div className="stat-card">
                            <div className="icon-box" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
                                <TrendingUp size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">إجمالي الوارد</span>
                                <span className="stat-value text-success">{totalIncome.toLocaleString()} ج.م</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="icon-box" style={{ background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d' }}>
                                <TrendingDown size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">إجمالي المصروفات</span>
                                <span className="stat-value text-danger">{totalExpense.toLocaleString()} ج.م</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="icon-box" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--primary)' }}>
                                <Wallet size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">صافي الربح</span>
                                <span className="stat-value" style={{ color: netProfit >= 0 ? 'var(--primary)' : '#ff4d4d' }}>
                                    {netProfit.toLocaleString()} ج.م
                                </span>
                            </div>
                        </div>
                    </div>


                </div>
            )}

            {/* Workshop Tab Removed */}

            {activeTab === 'customers' && (
                <div className="dashboard-fade-in">
                    <div className="stats-grid" style={{ marginBottom: '32px' }}>
                        <div className="stat-card glass">
                            <div className="icon-box" style={{ background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' }}>
                                <Users size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">إجمالي مستحقات العملاء</span>
                                <span className="stat-value text-success">{customers.reduce((sum, c) => sum + (c.balance || 0), 0).toLocaleString()} <small>ج.م</small></span>
                            </div>
                        </div>
                        <div className="stat-card glass">
                            <div className="icon-box" style={{ background: 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)', color: 'var(--primary)' }}>
                                <TrendingUp size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">تحصيلات اليوم</span>
                                <span className="stat-value">
                                    {transactions
                                        .filter(t => t.type === 'income' && t.category.includes('تعاقد') && new Date(t.date).toDateString() === new Date().toDateString())
                                        .reduce((sum, t) => sum + parseFloat(t.amount), 0).toLocaleString()} <small>ج.م</small>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="card glass" style={{ marginBottom: '32px' }}>
                        <div className="card-header-creative space-between">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileSpreadsheet size={20} className="text-primary" />
                                سجل حركات العملاء
                            </h3>
                            <button className="btn-icon" onClick={() => exportToExcel(transactions.filter(t => t.type === 'income' && (t.category.includes('تعاقد') || t.category.includes('عميل'))), 'سجل_تحصيلات_العملاء')}>
                                <FileSpreadsheet size={16} />
                            </button>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>التاريخ</th>
                                    <th>اسم العميل / البيان</th>
                                    <th>الحساب</th>
                                    <th>المبلغ</th>
                                    <th>الإجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions
                                    .filter(t =>
                                        t.customerName ||
                                        customers.some(c => c.name === t.account) ||
                                        (t.type === 'income' && (t.category.includes('تعاقد') || t.category.includes('عميل')))
                                    )
                                    .slice(0, 50) // Show last 50
                                    .map(t => (
                                        <tr key={t.id}>
                                            <td>{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                                            <td>
                                                <div style={{ fontWeight: '600' }}>{t.notes?.split(' - ')[0] || t.category}</div>
                                                <small className="text-secondary">{t.notes}</small>
                                            </td>
                                            <td>{t.account}</td>
                                            <td className={t.type === 'income' ? "text-success" : "text-danger"} style={{ fontWeight: 'bold' }}>
                                                {t.type === 'income' ? '+' : '-'}{parseFloat(t.amount).toLocaleString()} ج.م
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="btn-icon small" onClick={() => startEditTransaction(t)}><Edit size={14} /></button>
                                                    <button className="btn-icon small delete-btn" onClick={() => setTransactionToDelete(t)}><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                {transactions.filter(t => t.customerName || customers.some(c => c.name === t.account) || (t.type === 'income' && t.category.includes('تعاقد'))).length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>لا توجد حركات مسجلة بعد</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid" style={{ marginBottom: '32px' }}>
                        {customers.map(customer => (
                            <div key={customer.id} className="card glass customer-finance-card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <div>
                                        <h4 style={{ margin: 0 }}>{customer.name}</h4>
                                        <small className="text-secondary">{customer.phone}</small>
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: (customer.balance || 0) < 0 ? '#ff4d4d' : '#2ecc71' }}>
                                            {(customer.balance || 0).toLocaleString()} ج.م
                                        </div>
                                        <small style={{ fontSize: '10px', color: 'var(--text-dim)' }}>الرصيد الحالي</small>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn-secondary" style={{ flex: 1, fontSize: '12px' }} onClick={() => openStatement(customer)}>كشف حساب</button>
                                    <button className="btn-primary" style={{ flex: 1, fontSize: '12px' }} onClick={() => { setAddModalTab('customer'); setShowAddModal(true); }}>تحصيل دفعة</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* Transactions Table for General Tab */}
            {activeTab === 'general' && (
                <div className="table-container" style={{ marginTop: '32px' }}>
                    <div className="table-header-modern">
                        <div className="filter-toggle-wrapper">
                            <button
                                className={`btn-filter-modern ${showFilters ? 'active' : ''}`}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter size={18} />
                            </button>
                        </div>
                        <h3>سجل العمليات العامة</h3>
                    </div>

                    {showFilters && (
                        <div className="filter-bar glass dashboard-fade-in finance-filters" style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <div className="filter-item">
                                <label>نوع العملية</label>
                                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="glass">
                                    <option value="all">الكل</option>
                                    <option value="income">وارد</option>
                                    <option value="expense">صادر</option>
                                </select>
                            </div>
                            <div className="filter-item">
                                <label>فلتر بالعميل (بحث بالاسم)</label>
                                <input
                                    type="text"
                                    list="customer-list"
                                    value={customerFilter === 'all' ? '' : customerFilter}
                                    onChange={e => setCustomerFilter(e.target.value || 'all')}
                                    placeholder="ابدأ الكتابة للبحث..."
                                    className="glass"
                                />
                                <datalist id="customer-list">
                                    <option value="all">كل العملاء</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.name} />
                                    ))}
                                </datalist>
                            </div>
                            <div className="filter-item">
                                <label>من تاريخ</label>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="glass"
                                />
                            </div>
                            <div className="filter-item">
                                <label>إلى تاريخ</label>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="glass"
                                />
                            </div>
                        </div>
                    )}

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>البيان</th>
                                <th>الحساب</th>
                                <th>النوع</th>
                                <th>المبلغ</th>
                                <th>الإجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(t => (
                                <tr key={t.id}>
                                    <td>{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{t.category}</div>
                                        {t.notes && <small className="text-secondary" style={{ fontSize: '11px' }}>{t.notes}</small>}
                                        {t.customerName && <small className="text-primary" style={{ display: 'block', fontSize: '10px' }}>العميل: {t.customerName}</small>}
                                    </td>
                                    <td>{t.account}</td>
                                    <td><span className={`badge ${t.type === 'income' ? 'badge-success' : 'badge-danger'}`}>{t.type === 'income' ? 'وارد' : 'صادر'}</span></td>
                                    <td style={{ fontWeight: '700' }} className={t.type === 'income' ? 'text-success' : 'text-danger'}>
                                        {parseFloat(t.amount).toLocaleString()} ج.م
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn-icon-action" onClick={() => startEditTransaction(t)}><Edit size={16} /></button>
                                            <button className="btn-icon-action delete-btn" onClick={() => setTransactionToDelete(t)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '550px', padding: '0', overflow: 'hidden' }}>
                        {/* Tab Headers */}
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                            <button
                                className={`modal-tab-btn ${addModalTab === 'customer' ? 'active' : ''}`}
                                onClick={() => {
                                    setAddModalTab('customer');
                                    setNewTransaction({ ...newTransaction, type: 'income', category: 'دفعة تعاقد' });
                                }}
                                style={{ flex: 1, padding: '20px', border: 'none', background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
                            >
                                <Users size={18} style={{ marginBottom: '5px', display: 'block', margin: '0 auto 5px' }} />
                                معاملات العملاء
                            </button>
                            <button
                                className={`modal-tab-btn ${addModalTab === 'general' ? 'active' : ''}`}
                                onClick={() => {
                                    setAddModalTab('general');
                                    setNewTransaction({ ...newTransaction, type: 'expense', category: 'مصاريف تشغيل' });
                                }}
                                style={{ flex: 1, padding: '20px', border: 'none', background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
                            >
                                <SettingsIcon size={18} style={{ marginBottom: '5px', display: 'block', margin: '0 auto 5px' }} />
                                مصاريف عامة
                            </button>
                        </div>

                        <div style={{ padding: '25px' }}>
                            <h3 style={{ marginBottom: '20px' }}>
                                {transactionEditMode ? 'تعديل الحركة' :
                                    addModalTab === 'customer' ? 'تسجيل حركة عميل' : 'تسجيل مصروف عام'}
                            </h3>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>المبلغ (ج.م)</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="0.00"
                                        style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}
                                        value={newTransaction.amount}
                                        onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                    />
                                </div>

                                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="form-group">
                                        <label>الحساب المستخدم</label>
                                        <select
                                            value={newTransaction.account}
                                            onChange={e => setNewTransaction({ ...newTransaction, account: e.target.value })}
                                        >
                                            {accounts.map(acc => (
                                                <option key={acc.id} value={acc.name}>{acc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>التصنيف</label>
                                        <select
                                            value={newTransaction.category}
                                            onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                        >
                                            {addModalTab === 'customer' ? (
                                                <>
                                                    <option value="دفعة تعاقد">دفعة تعاقد</option>
                                                    <option value="دفعة استلام">دفعة استلام</option>
                                                    <option value="صيانة مدفوعة">صيانة مدفوعة</option>
                                                    <option value="أخرى">أخرى</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="خامات">شراء خامات</option>
                                                    <option value="نشر وتصنيع">نشر وتصنيع خارجي</option>
                                                    <option value="نقل وتوريد">نقل وتوريد</option>
                                                    <option value="يوميات عمال">يوميات عمال</option>
                                                    <option value="أخرى">أخرى</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>البيان / ملاحظات</label>
                                    <textarea
                                        rows="3"
                                        placeholder={addModalTab === 'customer' ? "اسم العميل وتفاصيل الدفعة..." : "تفاصيل المصروف..."}
                                        value={newTransaction.notes}
                                        onChange={e => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="modal-actions" style={{ marginTop: '30px' }}>
                                    <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>إلغاء</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                                        {addModalTab === 'customer' ? 'تأكيد التحصيل' : 'تأكيد الصرف'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <style>{`
                        .modal-tab-btn {
                            transition: all 0.3s ease;
                            opacity: 0.5;
                        }
                        .modal-tab-btn.active {
                            opacity: 1;
                            background: rgba(var(--primary-rgb), 0.1) !important;
                            border-bottom: 2px solid var(--primary) !important;
                        }
                    `}</style>
                </div>
            )}

            {/* Account Statement Modal */}
            {showStatementModal && selectedAccountForStatement && (
                <div className="modal-overlay">
                    <div className="modal glass statement-modal">
                        <div className="modal-header-tools">
                            <h3>كشف حساب: {selectedAccountForStatement.name}</h3>
                            <div className="account-total-badge">
                                الرصيد الحالي: {selectedAccountForStatement.balance.toLocaleString()} ج.م
                            </div>
                        </div>

                        <div className="statement-layout">
                            <div className="statement-table-container">
                                <table className="data-table small">
                                    <thead>
                                        <tr>
                                            <th>التاريخ</th>
                                            <th>البيان</th>
                                            <th>المبلغ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accountTransactions.map(t => (
                                            <tr key={t.id}>
                                                <td>{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                                                <td>{t.category} {t.notes && <span className="text-secondary" style={{ fontSize: '11px' }}>({t.notes})</span>}</td>
                                                <td className={t.type === 'income' ? 'text-success' : 'text-danger'} style={{ fontWeight: '600' }}>
                                                    {t.type === 'income' ? '+' : '-'}{parseFloat(t.amount).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {accountTransactions.length === 0 && (
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }} className="text-secondary">لا توجد معاملات مسجلة لهذا الحساب</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="statement-audit-sidebar">
                                <div className="audit-card">
                                    <h4>تسوية الرصيد يدويًا</h4>
                                    <p className="text-secondary" style={{ fontSize: '12px', marginBottom: '16px' }}>
                                        استخدم هذا الخيار لتصحيح الرصيد في حال وجود فروق مع الخزينة الفعلية.
                                    </p>
                                    <form onSubmit={handleAdjustment}>
                                        <div className="form-group">
                                            <label>الرصيد الفعلي الجديد</label>
                                            <input
                                                required
                                                type="number"
                                                placeholder="0.00"
                                                value={newAdjustment.newBalance}
                                                onChange={e => setNewAdjustment({ ...newAdjustment, newBalance: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>سبب التسوية</label>
                                            <textarea
                                                required
                                                rows="3"
                                                placeholder="مثلاً: جرد نقدي، مصاريف نثرية غير مسجلة..."
                                                value={newAdjustment.reason}
                                                onChange={e => setNewAdjustment({ ...newAdjustment, reason: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>تحديث الرصيد نهائياً</button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions" style={{ marginTop: '24px' }}>
                            <button type="button" className="btn-secondary" onClick={() => setShowStatementModal(false)}>إغلاق</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Recurring Expense Modal */}
            {showRecurringModal && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '450px' }}>
                        <h3>إضافة قالب مصروف دوري</h3>
                        <form onSubmit={handleRecurringSubmit}>
                            <div className="form-group">
                                <label>وصف المصروف (مثلاً: إيجار المعرض)</label>
                                <input
                                    required
                                    value={newRecurring.label}
                                    onChange={e => setNewRecurring({ ...newRecurring, label: e.target.value })}
                                />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>المبلغ الثابت</label>
                                    <input
                                        required
                                        type="number"
                                        value={newRecurring.amount}
                                        onChange={e => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>التصنيف</label>
                                    <select
                                        value={newRecurring.category}
                                        onChange={e => setNewRecurring({ ...newRecurring, category: e.target.value })}
                                    >
                                        <option value="مصاريف معرض">مصاريف معرض</option>
                                        <option value="كهرباء ومياه">كهرباء ومياه</option>
                                        <option value="إيجار">إيجار</option>
                                        <option value="نشر وتسويق">نشر وتسويق</option>
                                        <option value="بنزين وانتقالات">بنزين وانتقالات</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>يخصم من حساب</label>
                                <select
                                    value={newRecurring.account}
                                    onChange={e => setNewRecurring({ ...newRecurring, account: e.target.value })}
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.name}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowRecurringModal(false)}>إلغاء</button>
                                <button type="submit" className="btn-primary">حفظ القالب</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Transaction Confirmation */}
            {transactionToDelete && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <h3 style={{ color: '#ff4d4d', marginBottom: '20px' }}>تأكيد الحذف</h3>
                        <p style={{ marginBottom: '30px' }}>
                            هل أنت متأكد من رغبتك في حذف عملية "<strong>{transactionToDelete.category}</strong>" بمبلغ <strong>{parseFloat(transactionToDelete.amount).toLocaleString()} ج.م</strong>؟
                            <br />
                            <small className="text-secondary">(سيتم تعديل رصيد الخزينة تلقائياً)</small>
                        </p>
                        <div className="modal-actions" style={{ justifyContent: 'center', borderTop: 'none', paddingTop: 0 }}>
                            <button className="btn-secondary" onClick={() => setTransactionToDelete(null)}>إلغاء</button>
                            <button className="btn-primary" style={{ background: '#ff4d4d' }} onClick={confirmDeleteTransaction}>حذف الآن</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Account Modal */}
            {showAccountModal && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '450px' }}>
                        <h3>{accountEditMode ? 'تعديل حساب' : 'إضافة حساب معرض جديد'}</h3>
                        <form onSubmit={handleAccountSubmit}>
                            <div className="form-group">
                                <label>اسم الحساب (خزنة، بنك، عهدة...)</label>
                                <input
                                    required
                                    type="text"
                                    value={newAccount.name}
                                    onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>الرصيد الافتتاحي</label>
                                <input
                                    required
                                    type="number"
                                    value={newAccount.balance}
                                    onChange={e => setNewAccount({ ...newAccount, balance: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => { setShowAccountModal(false); setAccountEditMode(false); }}>إلغاء</button>
                                <button type="submit" className="btn-primary">{accountEditMode ? 'تحديث الحساب' : 'حفظ الحساب'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .finance-tabs-wrapper {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--glass-border);
                    overflow-x: auto;
                    display: flex;
                    scrollbar-width: none;
                }
                .finance-tabs-wrapper::-webkit-scrollbar { display: none; }
                .finance-tab {
                    padding: 12px 24px;
                    border: none;
                    background: transparent;
                    color: var(--text-dim);
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s;
                    border-radius: 12px;
                    white-space: nowrap;
                }
                .finance-tab.active {
                    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.2), rgba(var(--primary-rgb), 0.05));
                    color: var(--primary);
                    border: 1px solid rgba(var(--primary-rgb), 0.2);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .finance-tab:hover:not(.active) {
                    background: rgba(255,255,255,0.03);
                    color: white;
                }
                .finance-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 24px;
                    margin-top: 32px;
                }
                @media (max-width: 900px) {
                    .finance-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .account-item {
                    padding: 16px 0;
                    border-bottom: 1px solid var(--border-color);
                }
                .account-item:last-child {
                    border-bottom: none;
                }
                .account-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 10px;
                }
                .account-details {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .account-actions {
                    display: flex;
                    gap: 6px;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .account-item:hover .account-actions {
                    opacity: 1;
                }
                @media (max-width: 768px) {
                    .account-actions {
                        opacity: 1;
                    }
                }
                .btn-icon.small {
                    padding: 4px;
                    border-radius: 4px;
                }
                .account-name {
                    font-weight: 500;
                    color: var(--text-secondary);
                }
                .account-balance {
                    font-weight: 700;
                    color: white;
                }
                .balance-bar {
                    height: 6px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                    overflow: hidden;
                }
                .balance-progress {
                    height: 100%;
                    background: var(--primary);
                    border-radius: 3px;
                }
                .badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }
                .badge-success {
                    background: rgba(var(--primary-rgb), 0.1);
                    color: var(--primary);
                }
                .badge-danger {
                    background: rgba(255, 77, 77, 0.1);
                    color: #ff4d4d;
                }
                .table-header-modern {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 30px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 20px 20px 0 0;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-bottom: none;
                }
                @media (max-width: 768px) {
                    .table-header-modern {
                        padding: 15px 20px;
                    }
                }
                .table-header-modern h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: white;
                }
                .btn-filter-modern {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .btn-filter-modern:hover, .btn-filter-modern.active {
                    background: var(--primary);
                    color: white;
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
                }
                .finance-filters {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-top: none;
                    padding: 25px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                }
                .filter-item label {
                    display: block;
                    font-size: 12px;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                    font-weight: 600;
                }
                .filter-item select, .filter-item input {
                    width: 100%;
                    padding: 12px;
                    border-radius: 10px;
                    background: rgba(0,0,0,0.2) !important;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    outline: none;
                }
                .filter-group {
                    display: flex;
                    gap: 8px;
                }
                .chart-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px 0;
                }
                .donut-chart {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .donut-center {
                    width: 110px;
                    height: 110px;
                    background: var(--bg-surface);
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
                }
                .donut-center span {
                    font-size: 24px;
                    font-weight: 700;
                    color: white;
                }
                .donut-center small {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                .chart-legend {
                    margin-top: 24px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    width: 100%;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: var(--text-secondary);
                }
                .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 2px;
                }
                .recurring-list {
                    margin-top: 10px;
                }
                .recurring-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid var(--border-color);
                }
                .recurring-item:last-child {
                    border-bottom: none;
                }
                .recurring-title {
                    font-weight: 600;
                    margin-bottom: 2px;
                }
                .recurring-meta {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                .recurring-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .recurring-amount {
                    font-weight: 700;
                    color: var(--primary);
                }
                .btn-pay-recurring {
                    background: rgba(var(--primary-rgb), 0.1);
                    color: var(--primary);
                    border: 1px solid var(--primary);
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: 0.3s;
                }
                .btn-pay-recurring:hover {
                    background: var(--primary);
                    color: white;
                }
                .modal-header-tools {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .account-total-badge {
                    background: rgba(var(--primary-rgb), 0.1);
                    color: var(--primary);
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-weight: 700;
                    border: 1px dashed var(--primary);
                }
                .statement-layout {
                    display: grid;
                    grid-template-columns: 1fr 280px;
                    gap: 24px;
                }
                @media (max-width: 768px) {
                    .statement-layout {
                        grid-template-columns: 1fr;
                    }
                }
                .statement-table-container {
                    max-height: 400px;
                    overflow-y: auto;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                }
                .data-table.small {
                    font-size: 13px;
                }
                .data-table.small th, .data-table.small td {
                    padding: 10px 16px;
                }
                .audit-card {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--border-color);
                    padding: 20px;
                    border-radius: 12px;
                }
                .audit-card h4 {
                    margin-bottom: 8px;
                    color: var(--primary);
                }
            `}
            </style>

            {/* Delete Confirmation Modal */}
            {transactionToDelete && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '450px', textAlign: 'center' }}>
                        <div style={{
                            background: 'rgba(255, 77, 77, 0.1)',
                            borderRadius: '50%',
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Trash2 size={40} color="#ff4d4d" />
                        </div>
                        <h3 style={{ marginBottom: '12px' }}>تأكيد الحذف</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
                            هل أنت متأكد من حذف هذه المعاملة؟<br />
                            <strong style={{ color: 'var(--primary)' }}>
                                {parseFloat(transactionToDelete.amount).toLocaleString()} ج.م - {transactionToDelete.category}
                            </strong><br />
                            هذا الإجراء لا يمكن التراجع عنه.
                        </p>
                        <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                className="btn-secondary"
                                onClick={() => setTransactionToDelete(null)}
                                style={{ flex: 1 }}
                            >
                                إلغاء
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    deleteTransaction(transactionToDelete.id);
                                    setTransactionToDelete(null);
                                }}
                                style={{
                                    flex: 1,
                                    background: 'linear-gradient(135deg, #ff4d4d 0%, #cc0000 100%)',
                                    border: 'none'
                                }}
                            >
                                حذف نهائياً
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finance;
