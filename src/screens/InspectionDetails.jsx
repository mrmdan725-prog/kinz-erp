import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    Printer,
    ArrowRight,
    Download,
    CheckCircle2,
    Clock,
    Calendar,
    User,
    MapPin,
    Hammer,
    Zap,
    Droplets,
    Wind,
    Box
} from 'lucide-react';

const InspectionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { inspections, systemSettings, updateInspection } = useApp();
    const inspection = inspections.find(i => i.id === id);
    const printRef = useRef();

    if (!inspection) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <h2>المعاينة غير موجودة</h2>
                <button className="btn-secondary" onClick={() => navigate('/customers')}>
                    <ArrowRight size={18} />
                    العودة للعملاء
                </button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    const handleStatusUpdate = (newStatus) => {
        updateInspection({ ...inspection, status: newStatus });
    };

    return (
        <div className="inspection-details-container arabic-text">
            <div className="no-print actions-top" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', padding: '0 10px' }}>
                <button className="btn-secondary" onClick={() => navigate('/customers')}>
                    <ArrowRight size={18} />
                    العودة للعملاء
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {inspection.status === 'planned' && (
                        <button className="btn-primary" style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => handleStatusUpdate('completed')}>
                            <CheckCircle2 size={18} />
                            تأكيد الإتمام
                        </button>
                    )}
                    <button className="btn-primary" onClick={handlePrint}>
                        <Printer size={18} />
                        طباعة التقرير الفني
                    </button>
                </div>
            </div>

            <div className="inspection-report glass-paper" id="printable-report" ref={printRef} style={{ background: 'white', color: '#1a1a1a', padding: '20px', borderRadius: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Image Only Section */}
                <div className="inspection-attachment-hero" style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {inspection.attachment ? (
                        inspection.attachmentType?.includes('pdf') ? (
                            <div className="pdf-preview-box" style={{ padding: '60px', border: '2px dashed #eee', borderRadius: '20px' }}>
                                <div style={{ fontSize: '80px', marginBottom: '20px' }}>📄</div>
                                <div style={{ fontWeight: 'bold', fontSize: '24px', color: '#333' }}>ملف PDF للمعاينة</div>
                                <div style={{ fontSize: '16px', color: '#666', marginTop: '15px' }}>يمكنك تحميل الملف أو طباعة الصفحة</div>
                            </div>
                        ) : (
                            <img src={inspection.attachment} alt="Inspection" style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }} />
                        )
                    ) : (
                        <div className="no-attachment-msg" style={{ padding: '60px', color: '#ccc' }}>
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🖼️</div>
                            <div style={{ fontStyle: 'italic', fontSize: '18px' }}>لم يتم إرفاق صورة لهذه المعاينة</div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .inspection-details-container { padding: 0 !important; }
                    .inspection-report { 
                        box-shadow: none !important; 
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default InspectionDetails;
