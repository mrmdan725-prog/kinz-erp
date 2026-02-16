import React, { useState } from 'react';

const InspectionForm = ({ customer, onSubmit, onCancel, type }) => {
    const [formData, setFormData] = useState({
        customerId: customer.id,
        customerName: customer.name,
        type: type || 'kitchen', // kitchen or dressing
        representative: '',
        location: customer.address || '',
        price: '',
        attachment: '',
        attachmentType: '',
        status: 'planned', // planned, completed, cancelled
        scheduledDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setFormData({
                ...formData,
                attachment: event.target.result,
                attachmentType: file.type
            });
        };
        reader.readAsDataURL(file);
    };

    const resetAttachment = () => {
        setFormData({
            ...formData,
            attachment: '',
            attachmentType: ''
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="inspection-form">
            <div className="form-sections-scroller">
                <div className="section-header">البيانات الأساسية للمعاينة ({formData.type === 'kitchen' ? 'مطبخ' : 'درسينج'})</div>
                <div className="form-grid">
                    <div className="form-group">
                        <label>العميل</label>
                        <input className="row-input" type="text" value={formData.customerName} disabled />
                    </div>
                    <div className="form-group">
                        <label>القائم بالمعاينة</label>
                        <input className="row-input" type="text" value={formData.representative} onChange={e => setFormData({ ...formData, representative: e.target.value })} placeholder="اسم المهندس..." />
                    </div>
                    <div className="form-group">
                        <label>تاريخ المعاينة</label>
                        <input className="row-input" type="date" value={formData.scheduledDate} onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>حالة المعاينة</label>
                        <select className="row-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                            <option value="planned">مخطط لها (محجوزة)</option>
                            <option value="completed">مكتملة (تم الرفع)</option>
                            <option value="cancelled">ملغاة</option>
                        </select>
                    </div>
                    <div className="form-group full-width">
                        <label>الموقع</label>
                        <input className="row-input" type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                </div>

                <div className="section-header">الملفات والتكلفة</div>
                <div className="form-grid">
                    <div className="form-group">
                        <label>تكلفة المعاينة</label>
                        <div className="price-input-wrapper">
                            <input
                                className="row-input"
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                            />
                            <span className="currency-label">ج.م</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>إرفاق صورة أو تصميم (Image/PDF)</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                className="row-input"
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                style={{ flex: 1 }}
                            />
                            {formData.attachment && (
                                <button
                                    type="button"
                                    onClick={resetAttachment}
                                    style={{ background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer' }}
                                >
                                    حذف
                                </button>
                            )}
                        </div>
                        {formData.attachment && (
                            <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '5px' }}>
                                ✓ تم إرفاق الملف {formData.attachmentType.includes('pdf') ? '(PDF)' : '(صورة)'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="section-header">ملاحظات إضافية</div>
                <div className="form-group full-width">
                    <textarea
                        className="row-input"
                        rows="3"
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="أي تفاصيل أخرى..."
                    />
                </div>
            </div>

            <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>إلغاء</button>
                <button type="submit" className="btn-primary">حفظ المعاينة</button>
            </div>

            <style>{`
                .inspection-form {
                    padding: 0;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                }
                .form-sections-scroller {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0 20px;
                }
                .section-header {
                    background: rgba(var(--primary-rgb), 0.1);
                    color: var(--primary);
                    padding: 10px 15px;
                    border-radius: 8px;
                    font-weight: 700;
                    margin: 20px 0 15px 0;
                    font-size: 15px;
                    border-right: 4px solid var(--primary);
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 10px;
                }
                .form-group.full-width {
                    grid-column: 1 / -1;
                }
                .form-group label {
                    display: block;
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin-bottom: 6px;
                }
                .row-input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    padding: 10px 12px;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.2s;
                    box-sizing: border-box;
                }
                .row-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: rgba(255, 255, 255, 0.08);
                }
                .row-input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .modal-actions {
                    padding: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }
                .price-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .currency-label {
                    position: absolute;
                    left: 12px;
                    color: var(--text-secondary);
                    font-size: 12px;
                }
                .price-input-wrapper .row-input {
                    padding-left: 45px;
                }
            `}</style>
        </form>
    );
};

export default InspectionForm;
