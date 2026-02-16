import React, { useState, useEffect } from 'react';
import { RotateCcw, Save, Eye, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './ContractForm.css';

const ContractForm = ({ customers, onSubmit, onCancel, initialData, isEditing: isEditingProp }) => {
    const { contractOptions, systemSettings } = useApp();
    const isEditing = isEditingProp !== undefined ? isEditingProp : (!!initialData && !!initialData.id);

    const [formData, setFormData] = useState(() => {
        const defaults = {
            contractDate: new Date().toISOString().split('T')[0],
            representative: systemSettings.representativeName || '',
            firstPartyNationalId: systemSettings.representativeNationalId || '',
            customer: customers[0] || null,
            customerNationalId: '',
            projectType: '',

            // Wood Type Table (fixed categories)
            woodSpecs: [
                { label: 'الضلف السفلية', type: '', totalArea: '', pricePerMeter: '', totalPrice: '0' },
                { label: 'الضلف العلوية', type: '', totalArea: '', pricePerMeter: '', totalPrice: '0' },
                { label: 'البلاكار ( إن وجد )', type: '', totalArea: '', pricePerMeter: '', totalPrice: '0' },
                { label: 'التجاليد ( إن وجد )', type: '', totalArea: '', pricePerMeter: '', totalPrice: '0' }
            ],
            woodTotal: '0',

            // Basic Components
            components: {
                innerShellType: '',
                hinges: '',
                slides: '',
                upperHandles: '',
                lowerHandles: '',
                closetHandles: '',
                hanging: '',
                flipUps: '',
                legs: '',
                toeKick: ''
            },

            // Additional Accessories (starts empty or with initial data)
            accessories: [],
            accessoriesTotal: '0',

            grandTotal: '0',
            amountInWords: '',

            deposit: '0',
            operation: '0',
            delivery: '0'
        };

        if (initialData) {
            // Merge defaults with initialData
            const base = { ...defaults, ...initialData };

            // Map 'dimensions' to 'woodSpecs' if needed
            if (!base.woodSpecs && base.dimensions) {
                base.woodSpecs = [
                    { label: 'الضلف السفلية', type: base.dimensions[0]?.type || '', totalArea: base.dimensions[0]?.totalArea || '', pricePerMeter: base.dimensions[0]?.pricePerMeter || '', totalPrice: base.dimensions[0]?.totalPrice || '0' },
                    { label: 'الضلف العلوية', type: '', totalArea: '', pricePerMeter: '', totalPrice: '0' },
                    { label: 'البلاكار ( إن وجد )', type: '', totalArea: '', pricePerMeter: '', totalPrice: '0' },
                    { label: 'التجاليد ( إن وجد )', type: '', totalArea: '', pricePerMeter: '', totalPrice: '0' }
                ];
            }

            // Ensure components object exists
            if (!base.components) {
                base.components = { ...defaults.components };
            }

            // Sync project type and national ID if customer is provided but fields are empty
            if (base.customer) {
                if (!base.projectType) base.projectType = base.customer.projectType || '';
                if (!base.customerNationalId) base.customerNationalId = base.customer.nationalId || '';
            }

            return base;
        }

        return defaults;
    });

    // Auto-calculate totals
    useEffect(() => {
        const woodSum = formData.woodSpecs.reduce((acc, w) => acc + (parseFloat(w.totalPrice) || 0), 0);
        const accSum = formData.accessories.reduce((acc, a) => acc + (parseFloat(a.total) || 0), 0);
        const totalValue = woodSum + accSum;

        setFormData(prev => ({
            ...prev,
            woodTotal: woodSum.toString(),
            accessoriesTotal: accSum.toString(),
            grandTotal: totalValue.toString(),
            deposit: Math.round(totalValue * 0.6).toString(),
            operation: Math.round(totalValue * 0.3).toString(),
            delivery: Math.round(totalValue * 0.1).toString()
        }));
    }, [formData.woodSpecs, formData.accessories]);

    const handleWoodChange = (index, field, value) => {
        const newWood = [...formData.woodSpecs];
        newWood[index][field] = value;
        if (field === 'totalArea' || field === 'pricePerMeter') {
            newWood[index].totalPrice = (parseFloat(newWood[index].totalArea || 0) * parseFloat(newWood[index].pricePerMeter || 0)).toString();
        }
        setFormData({ ...formData, woodSpecs: newWood });
    };

    const handleAccChange = (index, field, value) => {
        const newAccs = [...formData.accessories];
        newAccs[index][field] = value;
        if (field === 'price' || field === 'count') {
            newAccs[index].total = (parseFloat(newAccs[index].price || 0) * parseFloat(newAccs[index].count || 0)).toString();
        }
        setFormData({ ...formData, accessories: newAccs });
    };

    const handleAddAccessory = () => {
        setFormData(prev => ({
            ...prev,
            accessories: [...prev.accessories, { name: '', price: '', count: '', total: '' }]
        }));
    };

    const handleRemoveAccessory = (index) => {
        setFormData(prev => ({
            ...prev,
            accessories: prev.accessories.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="contract-form-container">
            {/* NEW Premium Header Bar */}
            <div className="form-header-bar glass">
                <div className="header-title-info">
                    <span className="header-badge">{isEditing ? 'تعديل' : 'جديد'}</span>
                    <h3 className="header-main-title">{isEditing ? 'نموذج تعاقد لعميل' : 'إنشاء نموذج تعاقد جديد'}</h3>
                </div>

                <div className="header-quick-actions">
                    <button type="button" className="action-btn-header preview" onClick={() => onSubmit(formData, false)} title="معاينة">
                        <Eye size={18} />
                        <span>معاينة</span>
                    </button>
                    <button type="button" className="action-btn-header save" onClick={() => onSubmit(formData, true)} title="حفظ كمسودة">
                        <Save size={18} />
                        <span>حفظ</span>
                    </button>
                    <button type="button" className="action-btn-header exit" onClick={onCancel} title="خروج">
                        <LogOut size={18} />
                        <span>خروج</span>
                    </button>
                </div>
            </div>

            <div className="form-sections-scroller">
                {/* 1. Header & Parties Card */}
                <div className="form-card branding-card">
                    <div className="form-header-mimic">
                        <div className="mimic-header-top">
                            <div className="mimic-brand">
                                <span className="brand-logo-text"><span className="brand-primary">K</span>INZ</span>
                                <div className="brand-tagline">HOME ART</div>
                            </div>
                            <div className="mimic-date-box" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 'bold', textAlign: 'center' }}>
                                    {formData.serialNumber ? `رقم العقد: ${formData.serialNumber}` : 'رقم العقد: تلقائي'}
                                </div>
                                <label>تاريخ التعاقد</label>
                                <input type="date" value={formData.contractDate} onChange={e => setFormData({ ...formData, contractDate: e.target.value })} />
                            </div>
                            <div className="mimic-title-box">عقــــد إتفــــاق</div>
                        </div>

                        <div className="mimic-parties-section">
                            <div className="mimic-edit-row">
                                <div className="field-group">
                                    <label>ويمثلها السيد /</label>
                                    <input type="text" value={formData.representative} onChange={e => setFormData({ ...formData, representative: e.target.value })} placeholder="اسم ممثل الشركة" />
                                </div>
                                <div className="field-group">
                                    <label>( طرف أول ) رقم قومي</label>
                                    <input type="text" value={formData.firstPartyNationalId} onChange={e => setFormData({ ...formData, firstPartyNationalId: e.target.value })} placeholder="00000000000000" />
                                </div>
                            </div>

                            <div className="mimic-edit-row">
                                <div className="field-group">
                                    <label>والسيد /</label>
                                    <select
                                        className="customer-select"
                                        value={formData.customer?.id || ''}
                                        onChange={e => {
                                            const customer = customers.find(c => String(c.id) === String(e.target.value));
                                            setFormData({
                                                ...formData,
                                                customer,
                                                projectType: customer?.projectType || formData.projectType,
                                                customerNationalId: customer?.nationalId || formData.customerNationalId
                                            });
                                        }}
                                    >
                                        <option value="">اختر العميل...</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="field-group">
                                    <label>( طرف ثاني ) رقم قومي</label>
                                    <input type="text" value={formData.customerNationalId} onChange={e => setFormData({ ...formData, customerNationalId: e.target.value })} placeholder="00000000000000" />
                                </div>
                            </div>

                            <div className="mimic-edit-row-full">
                                <div className="field-group">
                                    <label>رقم هاتف العميل</label>
                                    <input type="text" readOnly className="disabled-input" value={formData.customer?.phone || ''} />
                                </div>
                            </div>

                            <div className="mimic-edit-row-full">
                                <div className="field-group">
                                    <label>عنوان التركيب</label>
                                    <input type="text" readOnly className="disabled-input" value={formData.customer?.address || ''} />
                                </div>
                            </div>

                            <div className="mimic-edit-row-full highlight-row">
                                <div className="field-group">
                                    <label>اتفق الطرفان على تنفيذ :</label>
                                    <select
                                        className="inner-table-input project-type-input"
                                        value={formData.projectType}
                                        onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                                    >
                                        <option value="">اختر نوع المشروع...</option>
                                        {contractOptions.projectTypes?.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Wood Specs Card */}
                <div className="form-card">
                    <div className="card-header">
                        <span className="card-icon">🪵</span>
                        <span className="card-title">نوع الخشب والمساحات</span>
                    </div>
                    <div className="card-body">
                        <div className="premium-form-table-container">
                            <table className="premium-form-table wood-specs-table">
                                <thead>
                                    <tr>
                                        <th>الصنف</th>
                                        <th>النوع</th>
                                        <th>إجمالي المساحة</th>
                                        <th>سعر المتر</th>
                                        <th>إجمالي السعر</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.woodSpecs.map((wood, idx) => (
                                        <tr key={idx}>
                                            <td className="row-label">{wood.label}</td>
                                            <td>
                                                <select className="inner-table-input" value={wood.type} onChange={e => handleWoodChange(idx, 'type', e.target.value)}>
                                                    <option value="">اختر...</option>
                                                    {contractOptions.woodTypes?.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </td>
                                            <td><input className="inner-table-input numeric" type="number" value={wood.totalArea} onChange={e => handleWoodChange(idx, 'totalArea', e.target.value)} /></td>
                                            <td><input className="inner-table-input numeric" type="number" value={wood.pricePerMeter} onChange={e => handleWoodChange(idx, 'pricePerMeter', e.target.value)} /></td>
                                            <td><input className="inner-table-input numeric result-field" disabled type="text" value={wood.totalPrice} /></td>
                                        </tr>
                                    ))}
                                    <tr className="sum-row">
                                        <td colSpan="4">الإجمالــــــــــــــــــــي</td>
                                        <td className="final-sum">{formData.woodTotal}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 3. Basic Components Card */}
                <div className="form-card">
                    <div className="card-header">
                        <span className="card-icon">🏗️</span>
                        <span className="card-title">المكونات الأساسية</span>
                    </div>
                    <div className="card-body">
                        <div className="form-compact-grid">
                            <div className="form-field">
                                <label>نوع العلب الداخلية</label>
                                <select className="inner-table-input" value={formData.components.innerShellType} onChange={e => setFormData({ ...formData, components: { ...formData.components, innerShellType: e.target.value } })}>
                                    <option value="">اختر...</option>
                                    {contractOptions.innerShellTypes?.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>تعليقة</label>
                                <select className="inner-table-input" value={formData.components.hanging} onChange={e => setFormData({ ...formData, components: { ...formData.components, hanging: e.target.value } })}>
                                    <option value="">اختر...</option>
                                    {contractOptions.hangingTypes?.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>مفصلات</label>
                                <select className="inner-table-input" value={formData.components.hinges} onChange={e => setFormData({ ...formData, components: { ...formData.components, hinges: e.target.value } })}>
                                    <option value="">اختر...</option>
                                    {contractOptions.hingeTypes?.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>قلابات</label>
                                <select className="inner-table-input" value={formData.components.flipUps} onChange={e => setFormData({ ...formData, components: { ...formData.components, flipUps: e.target.value } })}>
                                    <option value="">اختر...</option>
                                    {contractOptions.flipUpTypes?.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>مجر</label>
                                <select className="inner-table-input" value={formData.components.slides} onChange={e => setFormData({ ...formData, components: { ...formData.components, slides: e.target.value } })}>
                                    <option value="">اختر...</option>
                                    {contractOptions.slideTypes?.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>رجول</label>
                                <select className="inner-table-input" value={formData.components.legs} onChange={e => setFormData({ ...formData, components: { ...formData.components, legs: e.target.value } })}>
                                    <option value="">اختر...</option>
                                    {contractOptions.legTypes?.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>مقابض العلب العلوية</label>
                                <select className="inner-table-input" value={formData.components.upperHandles} onChange={e => setFormData({ ...formData, components: { ...formData.components, upperHandles: e.target.value } })}>
                                    <option value="">اختر...</option>
                                    {contractOptions.handleTypes?.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>وزر</label>
                                <select className="inner-table-input" value={formData.components.toeKick} onChange={e => setFormData({ ...formData, components: { ...formData.components, toeKick: e.target.value } })}>
                                    <option value="">اختر...</option>
                                    {contractOptions.toeKickTypes?.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>مقابض العلب السفلية</label>
                                <select className="inner-table-input" value={formData.components.lowerHandles} onChange={e => setFormData({ ...formData, components: { ...formData.components, lowerHandles: e.target.value } })}>
                                    <option value="">اختر...</option>
                                    {contractOptions.handleTypes?.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label>مقابض البلاكار</label>
                                <select className="inner-table-input" value={formData.components.closetHandles} onChange={e => setFormData({ ...formData, components: { ...formData.components, closetHandles: e.target.value } })}>
                                    <option value="">اختر...</option>
                                    {contractOptions.handleTypes?.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Additional Accessories Card */}
                <div className="form-card">
                    <div className="card-header flex-between">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="card-icon">🔧</span>
                            <span className="card-title">إكسسوارات إضافية</span>
                        </div>
                        <button type="button" className="btn-add-item" onClick={handleAddAccessory}>
                            <span className="plus-icon">+</span> إضافة صنف
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="premium-form-table-container">
                            <table className="premium-form-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>#</th>
                                        <th>اسم الصنف</th>
                                        <th style={{ width: '120px' }}>السعر</th>
                                        <th style={{ width: '100px' }}>العدد</th>
                                        <th style={{ width: '120px' }}>الإجمالي</th>
                                        <th style={{ width: '60px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.accessories.map((acc, idx) => (
                                        <tr key={idx}>
                                            <td className="row-number">{idx + 1}</td>
                                            <td>
                                                <select className="inner-table-input" value={acc.name} onChange={e => handleAccChange(idx, 'name', e.target.value)}>
                                                    <option value="">اختر...</option>
                                                    {contractOptions.accessoryNames?.map(n => <option key={n} value={n}>{n}</option>)}
                                                </select>
                                            </td>
                                            <td><input className="inner-table-input numeric" type="number" value={acc.price} onChange={e => handleAccChange(idx, 'price', e.target.value)} /></td>
                                            <td><input className="inner-table-input numeric" type="number" value={acc.count} onChange={e => handleAccChange(idx, 'count', e.target.value)} /></td>
                                            <td><input className="inner-table-input numeric result-field" disabled type="text" value={acc.total} /></td>
                                            <td>
                                                <button type="button" className="btn-remove-item" onClick={() => handleRemoveAccessory(idx)} title="حذف">
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {formData.accessories.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>لا توجد إكسسوارات مضافة. انقر فوق "إضافة صنف" للبدء.</td>
                                        </tr>
                                    )}
                                    <tr className="sum-row">
                                        <td colSpan="4">الإجمالــــــــــــــــــــي</td>
                                        <td className="final-sum">{formData.accessoriesTotal}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 5. Financials Card */}
                <div className="form-card financial-card">
                    <div className="card-header">
                        <span className="card-icon">💰</span>
                        <span className="card-title">المالية والدفعات</span>
                    </div>
                    <div className="card-body">
                        <div className="grand-total-display">
                            <div className="total-label">التكلفة الإجمالية</div>
                            <div className="total-value-box">
                                <span className="currency">EGP</span>
                                <span className="amount">{formData.grandTotal}</span>
                            </div>
                        </div>

                        <div className="payment-installments-grid">
                            <div className="installment-item">
                                <label>دفع تعاقت (60%)</label>
                                <input type="text" value={formData.deposit} onChange={e => setFormData({ ...formData, deposit: e.target.value })} />
                            </div>
                            <div className="installment-item">
                                <label>دفع تشغيل (30%)</label>
                                <input type="text" value={formData.operation} onChange={e => setFormData({ ...formData, operation: e.target.value })} />
                            </div>
                            <div className="installment-item">
                                <label>دفع استلام (10%)</label>
                                <input type="text" value={formData.delivery} onChange={e => setFormData({ ...formData, delivery: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-sticky-actions">
                <button type="button" className="btn-form-cancel" onClick={onCancel}>إلغاء</button>
                <div className="main-actions">
                    <button type="button" className="btn-form-draft" onClick={() => onSubmit(formData, true)}>حفظ كمسودة</button>
                    <button type="button" className="btn-form-primary" onClick={() => onSubmit(formData, false)}>معاينة العقد</button>
                </div>
            </div>
        </div>
    );
};

export default ContractForm;
