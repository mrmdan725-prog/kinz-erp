import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Printer, ArrowRight, Download, CheckCircle, Clock, XCircle } from 'lucide-react';

const InvoiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { invoices, systemSettings, updateInvoiceStatus } = useApp();
    const invoice = invoices.find(inv => inv.id === id);
    const printRef = useRef();

    if (!invoice) {
        return (
            <div className="error-state">
                <h2>الفاتورة غير موجودة</h2>
                <button className="btn-secondary" onClick={() => navigate('/invoices')}>
                    <ArrowRight size={18} />
                    العودة لقائمة الفواتير
                </button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'inspection': return 'فاتورة معاينة فنية';
            case 'contract': return 'فاتورة تعاقد مشروع';
            case 'material': return 'فاتورة مشتريات خامات';
            case 'payment': return 'فاتورة دفعة مرحلية';
            default: return 'فاتورة ضريبية';
        }
    };

    return (
        <div className="invoice-details-container">
            <div className="no-print actions-top">
                <button className="btn-secondary" onClick={() => navigate('/invoices')}>
                    <ArrowRight size={18} />
                    العودة للفواتير
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {invoice.status === 'draft' && (
                        <>
                            <button className="btn-primary" style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => updateInvoiceStatus(invoice.id, 'paid')}>
                                <CheckCircle size={18} />
                                تم التحصيل
                            </button>
                            <button className="btn-secondary text-danger" onClick={() => updateInvoiceStatus(invoice.id, 'cancelled')}>
                                <XCircle size={18} />
                                إلغاء الفاتورة
                            </button>
                        </>
                    )}
                    {invoice.status === 'paid' && (
                        <button className="btn-secondary" onClick={() => updateInvoiceStatus(invoice.id, 'draft')}>
                            <Clock size={18} />
                            إرجاع لمسودة
                        </button>
                    )}
                    <button className="btn-primary" onClick={handlePrint}>
                        <Printer size={18} />
                        طباعة الفاتورة
                    </button>
                </div>
            </div>

            <div className="invoice-paper glass-paper" id="printable-invoice" ref={printRef}>
                {/* Header Section */}
                <div className="invoice-header">
                    <div className="company-branding">
                        <div className="company-logo-circles">
                            <div className="circle-main">K</div>
                            <div className="circle-accent"></div>
                        </div>
                        <div className="company-info">
                            <h1>{systemSettings.companyName || 'كينز للأثاث والمطابخ الحديثة'}</h1>
                            <p>{systemSettings.address}</p>
                            <p>هاتف: {systemSettings.phone}</p>
                        </div>
                    </div>
                    <div className="invoice-meta">
                        <div className="invoice-title">{getTypeLabel(invoice.type)}</div>
                        <div className="meta-grid">
                            <div className="meta-item">
                                <label>رقم الفاتورة:</label>
                                <span>{invoice.number}</span>
                            </div>
                            <div className="meta-item">
                                <label>التاريخ:</label>
                                <span>{new Date(invoice.date).toLocaleDateString('ar-EG')}</span>
                            </div>
                            <div className="meta-item">
                                <label>الحالة:</label>
                                <span className={`status-text ${invoice.status}`}>
                                    {invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'draft' ? 'مسودة' : 'ملغاة'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="divider-glow"></div>

                {/* Client Section */}
                <div className="client-section">
                    <div className="bill-to">
                        <label>فاتورة إلى:</label>
                        <h3>{invoice.customerName}</h3>
                        <p>{invoice.customerAddress || 'عنوان العميل غير مسجل'}</p>
                        <p>{invoice.customerPhone}</p>
                    </div>
                </div>

                {/* Items Table */}
                <table className="invoice-items-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>الوصف</th>
                            <th>الكمية</th>
                            <th>سعر الوحدة</th>
                            <th>الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(invoice.items || []).map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.description}</td>
                                <td>{item.quantity}</td>
                                <td>{(item.unitPrice || 0).toLocaleString()}</td>
                                <td>{(item.total || 0).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Summary Section */}
                <div className="invoice-footer">
                    <div className="notes-section">
                        <label>ملاحظات:</label>
                        <p>{invoice.notes || 'شكراً لتعاملكم مع كينز للأثاث والمطابخ. نحن نسعى دائماً لتقديم أفضل جودة وتصميم.'}</p>
                    </div>
                    <div className="summary-section">
                        <div className="summary-row">
                            <span>المجموع الفرعي:</span>
                            <span>{(invoice.subtotal || 0).toLocaleString()} <small>ج.م</small></span>
                        </div>
                        <div className="summary-row">
                            <span>الضريبة ({systemSettings.taxRate || 14}%):</span>
                            <span>{(invoice.taxAmount || 0).toLocaleString()} <small>ج.م</small></span>
                        </div>
                        {invoice.discount > 0 && (
                            <div className="summary-row discount">
                                <span>الخصم:</span>
                                <span>-{(invoice.discount || 0).toLocaleString()} <small>ج.م</small></span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <span>الإجمالي النهائي:</span>
                            <span>{(invoice.totalAmount || 0).toLocaleString()} <small>ج.م</small></span>
                        </div>
                    </div>
                </div>

                {/* Footer Branding */}
                <div className="print-footer">
                    <p>هذه الفاتورة ناتجة آلياً عبر نظام Kinz ERP</p>
                    <p>© 2026 كينز للأثاث والمطابخ الحديثة</p>
                </div>
            </div>

            <style>{`
                .invoice-details-container {
                    padding: 10px;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .actions-top {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 25px;
                }
                .invoice-paper {
                    background: white;
                    color: #1a1a1a;
                    padding: 50px;
                    border-radius: 4px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    min-height: 800px;
                    position: relative;
                }
                .glass-paper {
                    background: #fff;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .invoice-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 40px;
                }
                .company-branding {
                    display: flex;
                    gap: 20px;
                    align-items: center;
                }
                .company-logo-circles {
                    position: relative;
                    width: 60px;
                    height: 60px;
                }
                .circle-main {
                    width: 100%;
                    height: 100%;
                    background: #1a1a1a;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    font-size: 32px;
                    font-weight: 900;
                    transform: rotate(-10deg);
                }
                .circle-accent {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background: #FA9A21;
                    border-radius: 50%;
                    bottom: -5px;
                    right: -5px;
                    border: 3px solid white;
                }
                .company-info h1 {
                    font-size: 20px;
                    color: #1a1a1a;
                    margin-bottom: 4px;
                }
                .company-info p {
                    font-size: 13px;
                    color: #666;
                    margin: 2px 0;
                }
                .invoice-meta {
                    text-align: left;
                }
                .invoice-title {
                    font-size: 24px;
                    font-weight: 800;
                    color: #1a1a1a;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                }
                .meta-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .meta-item {
                    display: flex;
                    justify-content: flex-end;
                    gap: 15px;
                    font-size: 14px;
                }
                .meta-item label {
                    color: #666;
                }
                .meta-item span {
                    font-weight: 700;
                }
                .status-text.paid { color: var(--primary); }
                .status-text.draft { color: #ffaa00; }
                .status-text.cancelled { color: #ff4d4d; }

                .divider-glow {
                    height: 2px;
                    background: linear-gradient(to right, transparent, #1a1a1a, transparent);
                    margin: 30px 0;
                    opacity: 0.1;
                }

                .client-section {
                    margin-bottom: 40px;
                }
                .bill-to label {
                    font-size: 11px;
                    text-transform: uppercase;
                    color: #999;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                    display: block;
                }
                .bill-to h3 {
                    font-size: 18px;
                    margin-bottom: 8px;
                }
                .bill-to p {
                    font-size: 14px;
                    color: #555;
                    margin: 4px 0;
                }

                .invoice-items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 40px;
                }
                .invoice-items-table th {
                    text-align: right;
                    padding: 12px;
                    background: #f9f9f9;
                    border-bottom: 2px solid #eee;
                    font-size: 13px;
                    color: #666;
                }
                .invoice-items-table td {
                    padding: 15px 12px;
                    border-bottom: 1px solid #eee;
                    font-size: 14px;
                }

                .invoice-footer {
                    display: flex;
                    justify-content: space-between;
                    gap: 50px;
                }
                .notes-section {
                    flex: 1;
                }
                .notes-section label {
                    font-size: 12px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    display: block;
                }
                .notes-section p {
                    font-size: 13px;
                    color: #666;
                    line-height: 1.6;
                }
                .summary-section {
                    width: 250px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    font-size: 14px;
                }
                .summary-row.total {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 2px solid #1a1a1a;
                    font-size: 18px;
                    font-weight: 800;
                }
                .summary-row.discount {
                    color: #ff4d4d;
                }
                
                .print-footer {
                    position: absolute;
                    bottom: 30px;
                    left: 0;
                    right: 0;
                    text-align: center;
                    font-size: 11px;
                    color: #999;
                    border-top: 1px solid #eee;
                    padding-top: 15px;
                    margin: 0 50px;
                }

                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .invoice-paper {
                        box-shadow: none !important;
                        padding: 20px !important;
                        margin: 0 !important;
                        width: 100% !important;
                        border: none !important;
                    }
                    .invoice-details-container {
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                }
                
                .error-state {
                    text-align: center;
                    padding: 50px;
                }
                .btn-icon {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    border-radius: 8px;
                    transition: background 0.2s;
                    color: var(--text-secondary);
                }
                .btn-icon:hover {
                    background: rgba(255,255,255,0.05);
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default InvoiceDetails;
