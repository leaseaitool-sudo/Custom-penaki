
import * as xlsx from 'xlsx';
import { Lease, AbstractedSection } from '@/shared/types';

// Helper to determine if a section is a Base Rent type
const isBaseRentSection = (title: string): boolean => {
    const t = title.toLowerCase();
    return t.includes('base rent') || t.includes('rent charge') || t.includes('free rent');
};

// Helper to extract clean date for sorting
const getSortDate = (section: AbstractedSection): number => {
    const startField = section.fields.find(f =>
        f.label.toLowerCase().includes('start') ||
        f.label.toLowerCase().includes('commencement')
    );
    if (startField?.value) {
        const d = new Date(startField.value);
        return isNaN(d.getTime()) ? 0 : d.getTime();
    }
    return 0;
};

// Feature 1: Extract and Format Rent Table Data
const generateRentTableRows = (lease: Lease): any[][] => {
    const rentSections = (lease.abstractedData || [])
        .filter(s => isBaseRentSection(s.title))
        .sort((a, b) => getSortDate(a) - getSortDate(b));

    if (rentSections.length === 0) {
        return [['No Base Rent extracted']];
    }

    // Change Header to "Rent Schedule"
    const tableRows: any[][] = [
        ['Rent Schedule', 'Start Date', 'End Date', 'Monthly Rent', 'Annual Rent']
    ];

    rentSections.forEach((section, index) => {
        // Attempt to find the specific fields in this section instance
        let start = section.fields.find(f => f.label.toLowerCase().includes('start') || f.label.toLowerCase().includes('commencement'))?.value;
        let end = section.fields.find(f => f.label.toLowerCase().includes('end') || f.label.toLowerCase().includes('expiry'))?.value;

        let monthlyVal = section.fields.find(f => f.label.toLowerCase().includes('monthly') && f.label.toLowerCase().includes('amount'))?.value;
        let annualVal = section.fields.find(f => f.label.toLowerCase().includes('annual') && f.label.toLowerCase().includes('amount'))?.value;

        // Auto-calculation logic
        const cleanNumber = (val: string) => parseFloat(val.replace(/[^0-9.]/g, ''));
        const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

        const hasMonthly = monthlyVal && monthlyVal.trim() !== '' && monthlyVal.trim() !== '-';
        const hasAnnual = annualVal && annualVal.trim() !== '' && annualVal.trim() !== '-';

        if (hasMonthly && !hasAnnual) {
            const m = cleanNumber(monthlyVal!);
            if (!isNaN(m)) {
                annualVal = formatMoney(m * 12);
            }
        } else if (!hasMonthly && hasAnnual) {
            const a = cleanNumber(annualVal!);
            if (!isNaN(a)) {
                monthlyVal = formatMoney(a / 12);
            }
        }

        // Ensure no empty columns
        start = (start && start.trim() !== '') ? start : '-';
        end = (end && end.trim() !== '') ? end : '-';
        monthlyVal = (monthlyVal && monthlyVal.trim() !== '') ? monthlyVal : '-';
        annualVal = (annualVal && annualVal.trim() !== '') ? annualVal : '-';

        tableRows.push([
            `Base Rent ${index + 1}`, // Sequence: Base Rent 1, Base Rent 2...
            start,
            end,
            monthlyVal,
            annualVal
        ]);
    });

    return tableRows;
};

// Helper function to generate worksheet data and styles for a single lease abstraction
const generateLeaseWorksheet = (lease: Lease): xlsx.WorkSheet | null => {
    if (!lease.abstractedData) return null;
    const isBundle = lease.documents.length > 1;
    const rows: any[][] = [];
    const merges: any[] = [];
    const headerRowIndices: number[] = [];

    // Track if base rent table has been rendered to avoid duplicates
    let baseRentRendered = false;

    // Feature 2: Track missing headings
    const missingHeadings: string[] = lease.abstractedData
        .filter(s => s.fields.every(f => f.value === null || f.value === undefined || f.value.trim() === ''))
        .map(s => s.title);

    // Iterate through ALL sections in order to preserve template structure
    lease.abstractedData.forEach(section => {
        // 1. Handle Base Rent Sections (Aggregated)
        if (isBaseRentSection(section.title)) {
            if (!baseRentRendered) {
                if (rows.length > 0) rows.push([]); // Spacer

                const rentTableHeaderIndex = rows.length;
                headerRowIndices.push(rentTableHeaderIndex);
                rows.push(['BASE RENT SCHEDULE']);
                merges.push({ s: { r: rentTableHeaderIndex, c: 0 }, e: { r: rentTableHeaderIndex, c: 4 } });

                const rentRows = generateRentTableRows(lease);
                rentRows.forEach(r => rows.push(r));

                baseRentRendered = true;
            }
            // Skip this iteration as it's either handled or subsequent base rent sections
            return;
        }

        // 2. Handle Regular Sections
        const validFields = section.fields.filter(field => field.value !== null && field.value !== undefined && field.value.trim() !== '');

        if (validFields.length === 0) return;

        if (rows.length > 0) rows.push([]);

        // Section Heading Row
        const headerRowIndex = rows.length;
        headerRowIndices.push(headerRowIndex);
        rows.push([section.title.toUpperCase()]);

        const colCount = isBundle ? 5 : 4;
        merges.push({ s: { r: headerRowIndex, c: 0 }, e: { r: headerRowIndex, c: colCount - 1 } });

        // Column Headers Row
        const colHeaders = ['Field', 'Extracted Value', 'Page Number', 'Source Snippet'];
        if (isBundle) colHeaders.push('File Name');
        rows.push(colHeaders);

        // Data Rows
        validFields.forEach(field => {
            const row = [
                field.label,
                field.value,
                field.page,
                field.snippet
            ];
            if (isBundle) row.push(field.fileName);
            rows.push(row);
        });
    });

    // 3. Feature 2: Add Missing Headings Section at the end
    rows.push([]); // Spacer
    const missingHeaderIndex = rows.length;
    headerRowIndices.push(missingHeaderIndex);
    rows.push(['NOT FOUND IN THE LEASE']);
    merges.push({ s: { r: missingHeaderIndex, c: 0 }, e: { r: missingHeaderIndex, c: 4 } });

    if (missingHeadings.length > 0) {
        // Single column list of heading names
        missingHeadings.forEach(h => rows.push([h]));
    } else {
        rows.push(['None']);
    }

    if (rows.length === 0) return null;

    const worksheet = xlsx.utils.aoa_to_sheet(rows);

    // Apply merges
    worksheet['!merges'] = merges;

    // Set column widths
    worksheet['!cols'] = [
        { wch: 30 }, // Field / Rent Schedule
        { wch: 40 }, // Value / Start
        { wch: 15 }, // Page / End
        { wch: 50 }, // Snippet / Monthly
        { wch: 20 }  // File Name / Annual
    ];

    // Apply Styles to Header Rows
    headerRowIndices.forEach(rowIndex => {
        const cellAddress = xlsx.utils.encode_cell({ r: rowIndex, c: 0 });
        if (!worksheet[cellAddress]) return;

        worksheet[cellAddress].s = {
            fill: { fgColor: { rgb: "BDD7EE" } }, // Light Blue
            font: { bold: true, sz: 12 },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            }
        };
    });

    return worksheet;
};

export const generateSingleLeaseExcel = (lease: Lease) => {
    const worksheet = generateLeaseWorksheet(lease);
    if (!worksheet) return;

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Abstraction');
    xlsx.writeFile(workbook, `Report_${lease.id}.xlsx`);
};

export const generateBulkLeaseExcel = (leases: Lease[]) => {
    if (leases.length === 0) return;

    const workbook = xlsx.utils.book_new();

    leases.forEach(lease => {
        const worksheet = generateLeaseWorksheet(lease);
        if (worksheet) {
            const safeName = `${lease.name.substring(0, 24)}_${lease.id}`.replace(/[:\\/?*[\]]/g, '').substring(0, 31);
            xlsx.utils.book_append_sheet(workbook, worksheet, safeName);
        }
    });

    if (workbook.SheetNames.length > 0) {
        xlsx.writeFile(workbook, 'All_Reports.xlsx');
    }
};
