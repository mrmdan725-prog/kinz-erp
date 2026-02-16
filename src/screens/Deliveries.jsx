import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, CheckCircle, Clock, Search, MapPin, Phone, FileText, FileSpreadsheet, DollarSign } from 'lucide-react';
import { exportToExcel, formatters } from '../utils/excelExport';

const Deliveries = () => {
    const { customers, updateCustomer } = useApp();
    const [searchTerm, setSearchTerm] = useState('');

    const deliveringProjects = customers.filter(c =>
        (c.status === 'delivery' || c.status === 'delivered') && (
            c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.projectType?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleCompleteDelivery = (customer) => {
        if (customer.status === 'delivered') return;

        if (window.confirm(`هل أنت متأكد من إتمام تسليم مشروع العميل "${customer.name}"؟`)) {
            updateCustomer({ ...customer, status: 'delivered' });
        }
    };

    const handleExport = () => {
        const dataToExport = deliveringProjects.map(c => ({
            'اسم العميل': c.name,
            'الهاتف': c.phone,
            'العنوان': c.address,
            'نوع المشروع': c.projectType,
            'حالة المشروع': c.status === 'delivered' ? 'تم التسليم' : 'جاري التسليم',
            'صافي الربح': c.balance
        }));
        exportToExcel(dataToExport, 'قائمة_التسليمات', 'التسليمات');
    };

    return (
        <div className="page dashboard-fade-in">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="icon-badge primary">
                        <Truck size={24} />
                    </div>
                    <div>
                        <h2>إدارة التسليمات</h2>
                        <p className="text-secondary">متابعة المشروعات الجاهزة للتسليم للعملاء</p>
                    </div>
                </div>
                <button className="btn-export-excel glass-interactive" onClick={handleExport} title="تصدير لإكسل">
                    <FileSpreadsheet size={18} />
                    تصدير البيانات
                </button>
            </div>

            <div className="search-bar no-print feature-search-box" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <Search size={18} className="text-secondary" />
                <input
                    type="text"
                    placeholder="بحث باسم العميل أو نوع المشروع..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="arabic-text"
                    style={{ textAlign: 'right', background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                />
            </div>

            <div className="grid">
                {deliveringProjects.length === 0 ? (
                    <div className="card glass text-center" style={{ gridColumn: '1 / -1', padding: '60px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <Truck size={40} className="text-muted" />
                        </div>
                        <h3 className="text-secondary">لا توجد مشاريع في مرحلة التسليم</h3>
                        <p className="text-muted">عند تغيير حالة العميل إلى "جاهز للتسليم"، سيظهر مشروعه هنا.</p>
                    </div>
                ) : (
                    deliveringProjects.map((customer) => (
                        <div key={customer.id} className="card glass fade-in" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div className="avatar" style={{ width: '50px', height: '50px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', fontSize: '20px', fontWeight: '800' }}>
                                        {customer.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '18px', marginBottom: '4px' }}>{customer.name}</h4>
                                        <span className="project-type-tag" style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>
                                            {customer.projectType || 'مشروع'}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div className={`status-badge ${customer.status === 'delivered' ? 'success' : 'delivery'}`}
                                        style={{
                                            fontSize: '11px',
                                            padding: '6px 12px',
                                            background: customer.status === 'delivered' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(241, 196, 15, 0.2)',
                                            color: customer.status === 'delivered' ? '#2ecc71' : '#f1c40f',
                                            border: `1px solid ${customer.status === 'delivered' ? 'rgba(46, 204, 113, 0.3)' : 'rgba(241, 196, 15, 0.3)'}`,
                                            borderRadius: '20px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                        {customer.status === 'delivered' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                        {customer.status === 'delivered' ? 'تم التسليم النهائي' : 'جاهز للتسليم (في الموقع)'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                    <Phone size={14} className="text-secondary" />
                                    <span>{customer.phone}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                    <MapPin size={14} className="text-secondary" />
                                    <span style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '120px'
                                    }} title={customer.address}>
                                        {customer.address || 'لا يوجد عنوان'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                    <DollarSign size={14} className="text-secondary" />
                                    <span>صافي الربح: <span style={{ color: (customer.balance || 0) >= 0 ? '#2ecc71' : '#ff4d4d', fontWeight: 'bold' }}>{(customer.balance || 0).toLocaleString()}</span></span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    className={'btn-primary'}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        opacity: customer.status === 'delivered' ? 0.5 : 1,
                                        cursor: customer.status === 'delivered' ? 'default' : 'pointer',
                                        background: customer.status === 'delivered' ? 'transparent' : 'var(--primary)',
                                        border: customer.status === 'delivered' ? '1px solid var(--glass-border)' : 'none'
                                    }}
                                    onClick={() => handleCompleteDelivery(customer)}
                                    disabled={customer.status === 'delivered'}
                                >
                                    <CheckCircle size={18} />
                                    {customer.status === 'delivered' ? 'تمت عملية التسليم' : 'إتمام التسليم النهائي'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Deliveries;
