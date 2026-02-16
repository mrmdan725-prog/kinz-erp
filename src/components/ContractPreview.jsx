import React from 'react';
import './ContractPreview.css';


const ContractSidebar = () => (
    <div className="contract-sidebar">
        <div className="sidebar-branding-text">KINZ HOME ART</div>
    </div>
);

const ContractHeader = ({ data, dayName, formattedDate }) => (
    <div className="contract-header-section">
        <div className="contract-watermark">K</div>
        <div className="contract-header-center">
            <div className="title-green-box">عقد إتفاق</div>
        </div>
        <div className="header-info-lines">
            <div className="intro-row" style={{ justifyContent: 'flex-start', fontSize: '16px', marginBottom: '20px' }}>
                <span style={{ fontWeight: '400' }}>انه في يوم ( </span>
                <span className="p-text" style={{ fontWeight: '900' }} contentEditable={true} suppressContentEditableWarning={true}>{dayName}</span>
                <span style={{ fontWeight: '400' }}> ) الموافق </span>
                <span className="p-text" style={{ fontWeight: '900' }} contentEditable={true} suppressContentEditableWarning={true}>{formattedDate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ fontWeight: '900', fontSize: '18px' }}>تم الاتفاق بين كلاً من :</div>
                {data.serialNumber && (
                    <div style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', border: '1px solid #e2e8f0' }}>
                        رقم العقد: {data.serialNumber}
                    </div>
                )}
            </div>

            <div className="intro-row" style={{ paddingRight: '15px', marginBottom: '12px' }}>
                <span style={{ fontWeight: '400' }}>السادة معرض </span>
                <span style={{ fontWeight: '950', margin: '0 4px', fontFamily: "'Noto Sans', sans-serif" }}>
                    <span style={{ color: 'var(--primary)' }}>K</span>
                    <span style={{ color: '#000' }}>INZ</span>
                </span>
                <span style={{ fontWeight: '900' }} contentEditable={true} suppressContentEditableWarning={true}> - فرع العاشر من رمضان</span>
            </div>

            <div className="intro-row flex-between" style={{ marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: '400' }}>ويمثلها السيد / </span>
                    <span className="p-text-long" contentEditable={true} suppressContentEditableWarning={true}>{data.representative || ''}</span>
                </div>
                <div style={{ width: '300px', textAlign: 'left' }}>
                    <span style={{ fontWeight: '400' }}>( طرف اول ) رقم قومي </span>
                    <span className="p-text" contentEditable={true} suppressContentEditableWarning={true}>{data.firstPartyNationalId || ''}</span>
                </div>
            </div>

            <div className="intro-row flex-between" style={{ marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: '400' }}>والسيد / </span>
                    <span className="p-text-long" contentEditable={true} suppressContentEditableWarning={true}>{data.customer?.name || ''}</span>
                </div>
                <div style={{ width: '300px', textAlign: 'left' }}>
                    <span style={{ fontWeight: '400' }}>( طرف ثاني ) رقم قومي </span>
                    <span className="p-text" contentEditable={true} suppressContentEditableWarning={true}>{data.customerNationalId || ''}</span>
                </div>
            </div>

            <div className="intro-row" style={{ marginBottom: '12px' }}>
                <span style={{ fontWeight: '400' }}>رقم هاتف / </span>
                <span className="p-text" contentEditable={true} suppressContentEditableWarning={true}>{data.customer?.phone || ''}</span>
            </div>

            <div className="intro-row" style={{ marginBottom: '20px' }}>
                <span style={{ fontWeight: '400' }}>عنوان التركيب / </span>
                <span className="p-text-long" contentEditable={true} suppressContentEditableWarning={true}>{data.customer?.address || ''}</span>
            </div>

            <div className="intro-row" style={{ justifyContent: 'flex-start', marginTop: '20px', fontWeight: '900', fontSize: '19px', gap: '5px' }}>
                <span style={{ fontWeight: '400' }}>اتفقا الطرفان علي تنفيذ ( </span>
                <span className="p-text" style={{ fontWeight: '900' }} contentEditable={true} suppressContentEditableWarning={true}>{data.projectType || 'مطبخ'}</span>
                <span style={{ fontWeight: '400' }}> )</span>
            </div>
        </div>
    </div>
);

const SpecificationsTable = ({ woodSpecs = [] }) => {
    const total = woodSpecs.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
    return (
        <div className="table-wrapper-with-label">
            <div className="table-side-label"><div className="side-label-text">نوع الخشب</div></div>
            <table className="contract-table">
                <thead>
                    <tr>
                        <th>الصنف</th>
                        <th>النوع</th>
                        <th>اجمالي المساحة</th>
                        <th>سعر المتر</th>
                        <th>اجمالي السعر</th>
                    </tr>
                </thead>
                <tbody>
                    {[
                        'الضلف السفلية',
                        'الضلف العلوية',
                        'البلاكار ( ان وجد )',
                        'التجاليد ( ان وجد )'
                    ].map((label, idx) => {
                        const wood = woodSpecs[idx] || {};
                        return (
                            <tr key={idx}>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }} contentEditable={true} suppressContentEditableWarning={true}>{label}</td>
                                <td contentEditable={true} suppressContentEditableWarning={true}>{wood.type || ''}</td>
                                <td contentEditable={true} suppressContentEditableWarning={true}>{wood.totalArea || ''}</td>
                                <td contentEditable={true} suppressContentEditableWarning={true}>{wood.pricePerMeter || ''}</td>
                                <td contentEditable={true} suppressContentEditableWarning={true}>{wood.totalPrice || ''}</td>
                            </tr>
                        );
                    })}
                    <tr className="total-row-highlight">
                        <td colSpan="4">الاجمالــــــــــــــــــــي</td>
                        <td>{total || '0'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const InternalComponentsTable = ({ components = {} }) => (
    <div className="table-wrapper-with-label">
        <div className="table-side-label"><div className="side-label-text" style={{ color: '#000' }}>المكونات الاساسية</div></div>
        <table className="contract-table">
            <tbody>
                <tr>
                    <td style={{ fontWeight: 'bold', width: '38%', whiteSpace: 'nowrap' }}>نوع العلب الداخلية</td>
                    <td style={{ width: '12%' }} contentEditable={true} suppressContentEditableWarning={true}>{components.innerShellType}</td>
                    <td style={{ fontWeight: 'bold', width: '38%', whiteSpace: 'nowrap' }}>تعليقة</td>
                    <td style={{ width: '12%' }} contentEditable={true} suppressContentEditableWarning={true}>{components.hanging}</td>
                </tr>
                <tr>
                    <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>مفصلات</td>
                    <td contentEditable={true} suppressContentEditableWarning={true}>{components.hinges}</td>
                    <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>قلابات</td>
                    <td contentEditable={true} suppressContentEditableWarning={true}>{components.flipUps}</td>
                </tr>
                <tr>
                    <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>مجر</td>
                    <td contentEditable={true} suppressContentEditableWarning={true}>{components.slides}</td>
                    <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>رجول</td>
                    <td contentEditable={true} suppressContentEditableWarning={true}>{components.legs}</td>
                </tr>
                <tr>
                    <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>مقابض العلب العلوية</td>
                    <td contentEditable={true} suppressContentEditableWarning={true}>{components.upperHandles}</td>
                    <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>وزر</td>
                    <td contentEditable={true} suppressContentEditableWarning={true}>{components.toeKick}</td>
                </tr>
                <tr>
                    <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>مقابض العلب السفلية</td>
                    <td contentEditable={true} suppressContentEditableWarning={true}>{components.lowerHandles}</td>
                    <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>مقابض البلاكار</td>
                    <td contentEditable={true} suppressContentEditableWarning={true}>{components.closetHandles}</td>
                </tr>
            </tbody>
        </table>
    </div>
);

const AccessoriesTable = ({ accessories = [] }) => {
    const total = accessories.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    return (
        <div className="table-wrapper-with-label">
            <div className="table-side-label"><div className="side-label-text">الاكسسوار الاضافي</div></div>
            <table className="contract-table">
                <thead>
                    <tr>
                        <th style={{ width: '35px' }}>م</th>
                        <th>نوع الاكسسوار</th>
                        <th>السعر</th>
                        <th>العدد</th>
                        <th>الاجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    {accessories.map((acc, idx) => (
                        <tr key={idx}>
                            <td style={{ width: '35px' }}>{idx + 1}</td>
                            <td style={{ textAlign: 'right' }} contentEditable={true} suppressContentEditableWarning={true}>{acc?.name || ''}</td>
                            <td contentEditable={true} suppressContentEditableWarning={true}>{acc?.price || ''}</td>
                            <td contentEditable={true} suppressContentEditableWarning={true}>{acc?.count || ''}</td>
                            <td contentEditable={true} suppressContentEditableWarning={true}>{acc?.total || ''}</td>
                        </tr>
                    ))}
                    <tr className="total-row-highlight">
                        <td colSpan="4">الاجمالــــــــــــــــــــي</td>
                        <td>{total || '0'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const GrandTotalSection = ({ data }) => {
    const woodTotal = (data.woodSpecs || []).reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
    const accTotal = (data.accessories || []).reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const calculatedGrandTotal = woodTotal + accTotal;

    return (
        <div className="footer-pricing-area" style={{ marginTop: '10px' }}>
            <div className="grand-total-section">
                <span className="total-label-text">التكلفة الاجمالية بعد الاضافات</span>
                <span className="total-amount-tag" contentEditable={true} suppressContentEditableWarning={true}>{data.grandTotal || calculatedGrandTotal}</span>
                <span className="total-label-text">فقط لا غير</span>
                {data.amountInWords && <span className="total-words" contentEditable={true} suppressContentEditableWarning={true}>({data.amountInWords})</span>}
            </div>
        </div>
    );
};

const PaymentSplitsSection = ({ data }) => {
    const woodTotal = (data.woodSpecs || []).reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
    const accTotal = (data.accessories || []).reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const calculatedGrandTotal = woodTotal + accTotal;

    return (
        <div className="footer-pricing-area">
            <div className="payment-tab-header">قيمة الدفعات</div>
            <table className="payment-table">
                <tbody>
                    <tr>
                        <td style={{ width: '40%' }}>دفع تعاقد 60 %</td>
                        <td style={{ width: '25%' }} contentEditable={true} suppressContentEditableWarning={true}>{data.deposit || (calculatedGrandTotal * 0.6).toFixed(0)}</td>
                        <td style={{ width: '35%' }} contentEditable={true} suppressContentEditableWarning={true}>أثناء التعاقد</td>
                    </tr>
                    <tr>
                        <td>دفع تشغيل 30 %</td>
                        <td contentEditable={true} suppressContentEditableWarning={true}>{data.operation || (calculatedGrandTotal * 0.3).toFixed(0)}</td>
                        <td contentEditable={true} suppressContentEditableWarning={true}>أثناء التشغيل</td>
                    </tr>
                    <tr>
                        <td>دفع استلام 10 %</td>
                        <td contentEditable={true} suppressContentEditableWarning={true}>{data.delivery || (calculatedGrandTotal * 0.1).toFixed(0)}</td>
                        <td contentEditable={true} suppressContentEditableWarning={true}>قبل الاستلام</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const CONTRACT_TERMS = [
    { label: "أولا", text: "تلتزم الشركة ببنود التعاقد ولا يجوز التعديل عليها كتابيا او شفويا من طرف الشركة او العميل" },
    { label: "ثانيا", text: "تلتزم الشركة بتسليم العميل المتفق عليه بالمواصفات المذكورة بالعقد طبقا للاتفاق بينهم كتابيا ولا يجوز الاتفاق شفويا علي اي بند خارج التعاقد والشركة غير ملتزمة بتسليمه" },
    { label: "ثالثا", text: "اتفق الطرفان علي انه لاتبرا ذمة العميل بالسداد سوي بايصال عن كل دفعة موقع من ادارة الشركة ومختومة بختم الشركة" },
    { label: "رابعا", text: "تلتزم الشركة بتوفير معاينة للتعاقد باجر رمزي يتم الاتفاق عليه بناءا علي موقع المعاينة" },
    { label: "خامسا", text: "تلتزم الشركة بتسليم التصميم بالالوان والتوزيع المتفق عليه وقت التعاقد ويلتزم العميل بالمراجعة والاستلام يوم التركيب" },
    { label: "سادسا", text: "تلتزم الشركة بتسليم ايصال مدفوعات نقدية مقابل كل دفعه يقوم العميل بسدادها" },
    { label: "سابعا", text: "يلتزم العميل بدفع مبلغ 60 % وقت التعاقد - و 30 % أثناء التشغيل و 10 % قبل الاستلام" },
    { label: "ثامنا", text: "يلتزم العميل باستكمال دفعة التعاقد خلال 72 ساعه بحد اقصي والا تعتبر الشركة غير ملتزمة بالتكلفة المذكورة في حالة التاخر" },
    { label: "تاسعا", text: "يلتزم العميل بسداد الدفعات المتفق عليها في التعاقد بمواعيدها واي تاخير يقابله تاخير في موعد التسليم" },
    { label: "العاشر", text: "يلتزم العميل بمراجعة المواصفات وقراءة البنود قبل التوقيع علي التعاقد" },
    { label: "الحادي عشر", text: "النقل علي نفقة العميل ويتم التحديد بالتعاقد والمشال حتي الدور الثاني بدون رسوم" },
    { label: "الثاني عشر", text: "يحق للعميل خلال 48 ساعة من التعاقد التعديل علي التصميم او الالوان" },
    { label: "الثالث عشر", text: "في حالة طلب العميل بالغاء بعد مدة اقصاها 5 ايام من تاريخ التعاقد يتم خصم 20% من قيمة التعاقد كاملة لصالح الشركة" },
    { label: "الرابع عشر", text: "الشركة لا تعتد بالتعديل علي العقد بخط اليد او التعديل مع غير المهندس المختص بالتعاقد" },
    { label: "الخامس عشر", text: "الشركة غير مسؤولة عن عيوب السيراميك والحوائط والمحارة اثناء التركيب" },
    { label: "السادس عشر", text: "في حالة عدم وفاء الشركة ببنود التعاقد يحق للعميل استرداد كافة المدفوعات موثقة بايصال استلام نقدية" },
    { label: "السابع عشر", text: "اي زيادات غير متعاقد عليها يتحمل العميل تكلفتها ولا يعتد بالاتفاقات الشفوية بين الطرفين" },
    { label: "الثامن عشر", text: "حرر هذا العقد من نسختين بيد كل طرف نسخة وفي حالة الشطب او الكشط يعتبر التعاقد لاغي" },
    { label: "التاسع عشر", text: "ضمان المنتج ضد عيوب الصناعة لمدة 5 سنوات من كينز للأثاث للأمانة والجودة" }
];

const ContractTermsPage = ({ data = {} }) => (
    <div className="contract-page second-page">
        <div className="terms-border-wrapper">
            <div className="terms-border-header">
                <span className="terms-header-text">بنود التعاقد</span>
            </div>
            <div className="terms-page-content">
                <div className="contract-watermark" style={{ top: '40%' }}>K</div>

                <div className="terms-list-container">
                    {CONTRACT_TERMS.map((term, idx) => (
                        <div key={idx} className="term-item">
                            <span className="term-label">{term.label} / </span>
                            <span className="term-text" contentEditable={true} suppressContentEditableWarning={true}>{term.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div style={{ marginTop: 'auto', width: '100%' }}>
            <SignaturesSection showTerms={false} />
        </div>
    </div>
);

const SignaturesSection = ({ showTerms = true }) => (
    <div className="signatures-wrapper">
        {showTerms && (
            <div className="terms-line" contentEditable={true} suppressContentEditableWarning={true}>
                وقد اتفق الطرف الاول بتسليم العميل المتفق عليه بالمواصفات المذكورة عاليه في مدة اقصاها 45 يوما من تاريخ التعاقد
            </div>
        )}
        <div className="signatures-area">
            <div className="sig-box-wrapper">
                <div className="canva-sig-box">
                    <div className="sig-title">توقيع الطرف الاول ( الشركة )</div>
                </div>
            </div>
            <div className="sig-box-wrapper">
                <div className="canva-sig-box">
                    <div className="sig-title">توقيع الطرف الثاني ( العميل )</div>
                </div>
            </div>
        </div>
    </div>
);

const ContractPreview = ({ data = {} }) => {
    if (!data || Object.keys(data).length === 0) return <div className="p-8 text-center bg-white shadow-xl rounded-2xl border-2 border-dashed border-gray-200" style={{ fontFamily: 'Droid Arabic Kufi' }}>الرجاء اختيار عقد للمعاينة</div>;

    let formattedDate = '/ /';
    let dayName = '.........';

    try {
        if (data.contractDate) {
            const dateObj = new Date(data.contractDate);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = data.contractDate.split('-').reverse().join(' / ');
                dayName = dateObj.toLocaleDateString('ar-EG', { weekday: 'long' });
            }
        }
    } catch (err) {
        console.error("Error processing contract date:", err);
    }

    return (
        <div className="contract-paper-container multidimensional">
            {/* PAGE 1: Specifications & Components */}
            <div className="contract-page">
                <ContractSidebar />
                <div className="contract-main-content">
                    <div className="contract-content-body">
                        <ContractHeader data={data} dayName={dayName} formattedDate={formattedDate} />
                        <div className="specs-title">بالمواصفات الآتية :</div>
                        <SpecificationsTable woodSpecs={data.woodSpecs} />
                        <InternalComponentsTable components={data.components} />
                        <AccessoriesTable accessories={data.accessories} />
                        <GrandTotalSection data={data} />
                    </div>
                </div>
            </div>

            {/* PAGE 2: Payments & Signatures */}
            <div className="contract-page page-2-pricing">
                <div className="contract-main-content">
                    <div className="contract-content-body">
                        <PaymentSplitsSection data={data} />
                    </div>
                    <div className="signatures-wrapper">
                        <SignaturesSection showTerms={true} />
                    </div>
                </div>
            </div>

            {/* PAGE 3: Terms & Conditions */}
            <ContractTermsPage data={data} />
        </div>
    );


};

export default ContractPreview;
