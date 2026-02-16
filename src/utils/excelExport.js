import * as XLSX from 'xlsx';

/**
 * Exports data to an Excel file.
 * @param {Array|Object} data - The data to export. Can be an array of objects or an object with sheet names as keys and arrays as values.
 * @param {string} fileName - The name of the resulting file (without extension).
 * @param {string} [sheetName='Data'] - The name of the worksheet (for single sheet exports).
 */
export const exportToExcel = (data, fileName, sheetName = 'Data') => {
    const wb = XLSX.utils.book_new();

    if (Array.isArray(data)) {
        // Single sheet export
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    } else if (typeof data === 'object') {
        // Multi-sheet export (e.g., for Dashboard Master Report)
        Object.entries(data).forEach(([name, sheetData]) => {
            const ws = XLSX.utils.json_to_sheet(sheetData);
            XLSX.utils.book_append_sheet(wb, ws, name);
        });
    }

    // Generate and download the file
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/**
 * Utility to format common entities for Excel export.
 */
export const formatters = {
    customer: (c) => ({
        'الاسم': c.name,
        'الهاتف': c.phone,
        'العنوان': c.address,
        'البريد الإلكتروني': c.email,
        'نوع المشروع': c.projectType === 'kitchen' ? 'مطبخ' : (c.projectType === 'dressing' ? 'درسينج' : 'كلاهما'),
        'الرصيد': c.balance || 0
    }),
    transaction: (t) => ({
        'التاريخ': new Date(t.date).toLocaleDateString('ar-EG'),
        'الفئة': t.category,
        'النوع': t.type === 'income' ? 'إيراد' : 'مصروف',
        'المبلغ': t.amount,
        'الحساب': t.account,
        'ملاحظات': t.notes || ''
    }),
    purchase: (p) => ({
        'العميل': p.customerName,
        'المادة': p.materialName,
        'الكمية': p.quantity,
        'سعر الوحدة': p.unitPrice,
        'الإجمالي': p.total,
        'التاريخ': new Date(p.date).toLocaleDateString('ar-EG'),
        'الحساب المخصوم': p.account
    }),
    inventory: (i) => ({
        'اسم المادة': i.name,
        'المخزون الحالي': i.stock,
        'الوحدة': i.unit,
        'الحالة': i.stock < 10 ? 'مخزون منخفض' : 'متوفر'
    })
};
