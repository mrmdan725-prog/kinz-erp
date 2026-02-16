import React from 'react';
import {
    X,
    Calendar,
    DollarSign,
    FileText,
    ClipboardList,
    CheckCircle2,
    Clock,
    User,
    Phone,
    MapPin,
    Hammer,
    Receipt
} from 'lucide-react';

const ContractDetails = ({ contract, onClose, systemSettings, onGenerateInvoice }) => {
    if (!contract) return null;

    const currency = systemSettings?.currency || 'ج.م';
    const grandTotal = parseFloat(contract.accessoriesTotal || 0);

    // Calculate total paid
    const totalPaid = Object.values(contract.payments || {}).reduce((sum, p) =>
        sum + (p.received ? parseFloat(p.amount || 0) : 0), 0);

    const remaining = grandTotal - totalPaid;

    return (
        <div className="modal-overlay">
            <div className="modal glass contract-details-modal" style={{ maxWidth: '1000px', width: '95%' }}>
                <div className="contract-header-details" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="btn-icon glass-interactive"
                            onClick={() => onGenerateInvoice(contract)}
                            title="إصدار فاتورة"
                            style={{
                                height: '42px',
                                padding: '0 16px',
                                background: 'linear-gradient(135deg, rgba(238, 182, 91, 0.15) 0%, rgba(238, 182, 91, 0.08) 100%)',
                                border: '1px solid var(--primary)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 4px 15px rgba(238, 182, 91, 0.2)',
                                color: 'var(--primary)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(238, 182, 91, 0.35)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(238, 182, 91, 0.2)';
                            }}
                        >
                            <Receipt size={20} />
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>إصدار فاتورة</span>
                        </button>
                        <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="icon-badge glass" style={{ padding: '12px', borderRadius: '12px' }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>تفاصيل العقد: {contract.customer?.name}</h2>
                            <p className="text-secondary" style={{ fontSize: '13px' }}>تاريخ التعاقد: {contract.contractDate}</p>
                        </div>
                    </div>
                </div>

                <div className="details-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 320px', gap: '24px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px' }}>

                    {/* Main Content: Info and Specs */}
                    <div className="details-main">
                        {/* Customer Info Card */}
                        <div className="info-section-card glass" style={{ marginBottom: '24px' }}>
                            <h3 className="section-title"><User size={18} /> بيانات العميل</h3>
                            <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                                <div className="info-item">
                                    <label>الجوال</label>
                                    <span>{contract.customer?.phone}</span>
                                </div>
                                <div className="info-item">
                                    <label>العرض المقدم لـ</label>
                                    <span>{contract.representative || '---'}</span>
                                </div>
                                <div className="info-item" style={{ gridColumn: 'span 2' }}>
                                    <label>العنوان</label>
                                    <span>{contract.customer?.address}</span>
                                </div>
                            </div>
                        </div>

                        {/* Project Specs Card */}
                        <div className="info-section-card glass" style={{ marginBottom: '24px' }}>
                            <h3 className="section-title"><Hammer size={18} /> مواصفات المشروع</h3>
                            <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                                <div className="spec-group">
                                    <label className="spec-label">نوع المشروع</label>
                                    <div className="spec-value">{contract.projectType}</div>
                                </div>
                                <div className="spec-group">
                                    <label className="spec-label">العلب الداخلية</label>
                                    <div className="spec-value">{contract.innerShellType} / {contract.innerShellColor}</div>
                                </div>
                                <div className="spec-group">
                                    <label className="spec-label">الضلف السفلية</label>
                                    <div className="spec-value">{contract.lowerShellType} / {contract.lowerShellColor}</div>
                                </div>
                                <div className="spec-group">
                                    <label className="spec-label">الضلف العلوية</label>
                                    <div className="spec-value">{contract.upperShellType} / {contract.upperShellColor}</div>
                                </div>
                            </div>
                        </div>

                        {/* Dimensions & Accessories Tables */}
                        <div className="info-section-card glass">
                            <h3 className="section-title"><ClipboardList size={18} /> تفاصيل المساحات</h3>
                            <table className="data-table small" style={{ marginTop: '15px' }}>
                                <thead>
                                    <tr>
                                        <th>النوع</th>
                                        <th>المساحة</th>
                                        <th>السعر</th>
                                        <th>الاجمالي</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contract.dimensions?.map((dim, i) => (
                                        <tr key={i}>
                                            <td>{dim.type}</td>
                                            <td>{dim.totalDim} م</td>
                                            <td>{parseFloat(dim.pricePerMeter).toLocaleString()}</td>
                                            <td>{parseFloat(dim.totalPrice).toLocaleString()} {currency}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Sidebar: Financials and Timeline */}
                    <div className="details-sidebar">
                        {/* Summary Card */}
                        <div className="summary-card glass" style={{ background: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid rgba(var(--primary-rgb), 0.1)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                            <div className="summary-item" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '5px' }}>الإجمالي الكلي</label>
                                <span style={{ fontSize: '24px', fontWeight: '800' }}>{grandTotal.toLocaleString()} {currency}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--primary)', marginBottom: '2px' }}>محصل</label>
                                    <span style={{ fontWeight: '700' }}>{totalPaid.toLocaleString()}</span>
                                </div>
                                <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#ff4d4d', marginBottom: '2px' }}>متبقي</label>
                                    <span style={{ fontWeight: '700' }}>{remaining.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Status Timeline */}
                        <div className="timeline-card glass" style={{ padding: '20px', borderRadius: '12px' }}>
                            <h3 className="section-title" style={{ fontSize: '15px', marginBottom: '20px' }}><DollarSign size={16} /> حالة الدفعات</h3>
                            <div className="timeline">
                                {[
                                    { id: 'deposit', label: 'دفعة التعاقد (60%)', ratio: 0.6 },
                                    { id: 'operation', label: 'دفعة التشغيل (30%)', ratio: 0.3 },
                                    { id: 'delivery', label: 'دفعة الاستلام (10%)', ratio: 0.1 }
                                ].map((p, idx) => {
                                    const paymentAmount = parseFloat(contract[p.id]) || Math.round(grandTotal * p.ratio);
                                    const payment = contract.payments?.[p.id];
                                    return (
                                        <div key={p.id} className={`timeline-item ${payment?.received ? 'active' : ''}`} style={{
                                            display: 'flex',
                                            gap: '15px',
                                            position: 'relative',
                                            paddingBottom: idx === 2 ? 0 : '25px',
                                            opacity: payment?.received ? 1 : 0.6
                                        }}>
                                            {idx !== 2 && <div style={{
                                                position: 'absolute',
                                                right: '9px',
                                                top: '22px',
                                                bottom: '5px',
                                                width: '2px',
                                                background: payment?.received ? 'var(--primary)' : 'rgba(255,255,255,0.05)'
                                            }} />}
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                background: payment?.received ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                                border: payment?.received ? '4px solid rgba(var(--primary-rgb), 0.2)' : 'none',
                                                zIndex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {payment?.received && <CheckCircle2 size={12} color="white" />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{p.label}</span>
                                                    <span style={{ fontSize: '12px', fontWeight: '700' }}>{paymentAmount.toLocaleString()}</span>
                                                </div>
                                                {payment?.received ? (
                                                    <span style={{ fontSize: '11px', color: 'var(--primary)' }}>
                                                        تم التحصيل في {new Date(payment.date).toLocaleDateString('ar-EG')}
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>بانتظار التحصيل</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                    .contract-details-modal {
                        animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                        border: 1px solid rgba(var(--primary-rgb), 0.2);
                        box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    }
                    .info-section-card {
                        padding: 20px;
                        border-radius: 12px;
                        background: rgba(255,255,255,0.02);
                        border: 1px solid rgba(255,255,255,0.05);
                    }
                    .section-title {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-size: 16px;
                        font-weight: 700;
                        color: var(--primary);
                        border-bottom: 1px solid rgba(var(--primary-rgb), 0.1);
                        padding-bottom: 12px;
                    }
                    .info-item label {
                        display: block;
                        font-size: 11px;
                        color: var(--text-secondary);
                        margin-bottom: 4px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .info-item span {
                        font-weight: 500;
                        color: white;
                    }
                    .spec-label {
                        font-size: 11px;
                        color: rgba(var(--primary-rgb), 0.7);
                        margin-bottom: 6px;
                        display: block;
                    }
                    .spec-value {
                        background: rgba(255,255,255,0.03);
                        padding: 8px 12px;
                        border-radius: 8px;
                        font-size: 13px;
                        border: 1px solid rgba(255,255,255,0.05);
                    }
                    @keyframes scaleIn {
                        from { transform: scale(0.95); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default ContractDetails;
