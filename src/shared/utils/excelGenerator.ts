
import * as xlsx from 'xlsx';
import { Lease, AbstractedSection } from '@/shared/types';

// ═══════════════════════════════════════════════════════════════════
// STYLES  (xlsx-js-style format – fgColor uses ARGB hex)
// ═══════════════════════════════════════════════════════════════════

const NAVY = '1A233A';        // dark navy for section banners
const GREY = 'D9D9D9';        // light grey for column sub-headers
const WHITE_FONT = 'FFFFFF';
const BLACK = '000000';

const thinBorder = {
    top:    { style: 'thin', color: { rgb: BLACK } },
    bottom: { style: 'thin', color: { rgb: BLACK } },
    left:   { style: 'thin', color: { rgb: BLACK } },
    right:  { style: 'thin', color: { rgb: BLACK } },
};

const sTitle: any = {
    font: { bold: true, sz: 12 },
};

const sDarkBanner: any = {
    fill: { fgColor: { rgb: NAVY } },
    font: { bold: true, color: { rgb: WHITE_FONT }, sz: 9 },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: thinBorder,
};

const sSubHeader: any = {
    fill: { fgColor: { rgb: GREY } },
    font: { bold: true, sz: 8 },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: thinBorder,
};

const sLabelBold: any = {
    font: { bold: true, sz: 8 },
    border: thinBorder,
    alignment: { wrapText: true, vertical: 'top' }
};

const sCell: any = {
    font: { sz: 8 },
    border: thinBorder,
    alignment: { wrapText: true, vertical: 'top' },
};

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

type SCell = { r: number; c: number; s: any };

/** Find a field value by label, case-insensitive. */
const fv = (sec: AbstractedSection | undefined, label: string): string =>
    sec?.fields.find(f => f.label.toUpperCase() === label.toUpperCase())?.value || '';

/** Find ALL sections whose title starts with `prefix` (case-insensitive). */
const findSections = (data: AbstractedSection[], prefix: string) =>
    data.filter(s => s.title.toUpperCase().startsWith(prefix.toUpperCase()));

// ═══════════════════════════════════════════════════════════════════
// CUSTOM TEMPLATE  –  Exact clone of the reference screenshot
// ═══════════════════════════════════════════════════════════════════

const generateCustomLeaseWorksheet = (lease: Lease): xlsx.WorkSheet | null => {
    if (!lease.abstractedData) return null;

    const rows: any[][] = [];
    const merges: xlsx.Range[] = [];
    const styled: SCell[] = [];

    // ── Row 0 : LEASE ABSTRACT title ───────────────────────────
    rows.push(['LEASE ABSTRACT']);
    styled.push({ r: 0, c: 0, s: sTitle });
    rows.push([]); // blank row 1

    // ── helper closures ────────────────────────────────────────
    const addBanner = (title: string, colSpan: number) => {
        const r = rows.length;
        const row = new Array(colSpan).fill('');
        row[0] = title;
        rows.push(row);
        merges.push({ s: { r, c: 0 }, e: { r, c: colSpan - 1 } });
        for (let c = 0; c < colSpan; c++) styled.push({ r, c, s: sDarkBanner });
    };

    const addSubHeaders = (headers: string[]) => {
        const r = rows.length;
        rows.push(headers);
        headers.forEach((_, c) => styled.push({ r, c, s: sSubHeader }));
    };

    const addDataRow = (cells: string[]) => {
        const r = rows.length;
        rows.push(cells);
        cells.forEach((_, c) => styled.push({ r, c, s: sCell }));
    };

    const addBlankDataRows = (cols: number, count: number = 2) => {
        for (let i = 0; i < count; i++) addDataRow(new Array(cols).fill(''));
    };

    // ═══════════════════════════════════════════════════════════
    // 1.  LEASE INFORMATION  (4-column key-value grid)
    // ═══════════════════════════════════════════════════════════
    addBanner('LEASE INFORMATION', 4);

    const li = lease.abstractedData!.find(s => s.title.toUpperCase() === 'LEASE INFORMATION');

    const liPairs: [string, string, string, string][] = [
        ['Type',            fv(li, 'Type'),            'Lease',          fv(li, 'Lease')],
        ['Status',          fv(li, 'Status'),          'Property',       fv(li, 'Property')],
        ['Duration',        fv(li, 'Duration'),        'Property Address', fv(li, 'Prop. Address') || fv(li, 'Property Address')],
        ['From',            fv(li, 'From'),            'Landlord',       fv(li, 'Landlord')],
        ['To',              fv(li, 'To'),              'L. Address',     fv(li, 'L. Address')],
        ['Effective Date',  fv(li, 'Effective Date'),  'Tenant',         fv(li, 'Tenant')],
        ['Contracted Area', fv(li, 'Contracted Area'), 'T. Address',     fv(li, 'T. Address')],
    ];

    liPairs.forEach(([lbl1, val1, lbl2, val2]) => {
        const r = rows.length;
        rows.push([lbl1, val1, lbl2, val2]);
        styled.push({ r, c: 0, s: sLabelBold });
        styled.push({ r, c: 1, s: sCell });
        styled.push({ r, c: 2, s: sLabelBold });
        styled.push({ r, c: 3, s: sCell });
    });

    rows.push([]); // spacer

    // ═══════════════════════════════════════════════════════════
    // 2.  SPACE  (4 columns)
    // ═══════════════════════════════════════════════════════════
    const SPACE_COLS = ['Unit', 'Floor', 'Status', 'Area'];
    addBanner('SPACE', SPACE_COLS.length);
    addSubHeaders(SPACE_COLS);

    const spaces = findSections(lease.abstractedData!, 'SPACE');
    if (spaces.length > 0) {
        spaces.forEach(sp => addDataRow(SPACE_COLS.map(h => fv(sp, h))));
    } else {
        addBlankDataRows(SPACE_COLS.length);
    }
    rows.push([]);

    // ═══════════════════════════════════════════════════════════
    // 3.  RENT SCHEDULE  (9 columns – includes Mgmt Fees)
    // ═══════════════════════════════════════════════════════════
    const CS_COLS = ['Charge type', 'description', 'Date From', 'Date To', 'Monthly Amt', 'Annual Amt', 'Area', 'Amt Per Area', 'Mgmt Fees'];
    addBanner('RENT SCHEDULE', CS_COLS.length);
    addSubHeaders(CS_COLS);

    const charges = findSections(lease.abstractedData!, 'RENT SCHEDULE');
    if (charges.length > 0) {
        charges.forEach(ch => addDataRow([
            fv(ch, 'Charge type'), fv(ch, 'Description'), fv(ch, 'Date From'), fv(ch, 'Date To'),
            fv(ch, 'Monthly Amt'), fv(ch, 'Annual Amt'), fv(ch, 'Area'), fv(ch, 'Amt Per Area'), fv(ch, 'Mgmt Fees'),
        ]));
    } else {
        addBlankDataRows(CS_COLS.length);
    }
    rows.push([]);

    // ═══════════════════════════════════════════════════════════
    // 4.  RECOVERY  (9 columns – includes Base Amt)
    // ═══════════════════════════════════════════════════════════
    const REC_COLS = ['Recovery Type', 'Description', 'From', 'To', 'EOY Month', 'Base Year', 'Base Amt', 'Pro Rata %', 'CAM Cap%'];
    addBanner('RECOVERY', REC_COLS.length);
    addSubHeaders(REC_COLS);

    const recoveries = findSections(lease.abstractedData!, 'RECOVERY');
    if (recoveries.length > 0) {
        recoveries.forEach(rc => addDataRow(REC_COLS.map(h => fv(rc, h))));
    } else {
        addBlankDataRows(REC_COLS.length);
    }
    rows.push([]);

    // ═══════════════════════════════════════════════════════════
    // 5.  LATE FEE  (5 columns – includes Serial no.)
    // ═══════════════════════════════════════════════════════════
    const LF_COLS = ['Serial no.', 'Grace Period', 'Late Fee Type', 'Late Fee Amount / %', 'Daily Fee'];
    addBanner('LATE FEE', LF_COLS.length);
    addSubHeaders(LF_COLS);

    const lateFees = findSections(lease.abstractedData!, 'LATE FEE');
    if (lateFees.length > 0) {
        lateFees.forEach((lf, idx) => addDataRow([
            String(idx), fv(lf, 'Grace Period'), fv(lf, 'Late Fee Type'), fv(lf, 'Late Fee Amount / %'), fv(lf, 'Daily Fee'),
        ]));
    } else {
        addBlankDataRows(LF_COLS.length);
    }
    rows.push([]);

    // ═══════════════════════════════════════════════════════════
    // 6.  OPTIONS  (8 columns)
    // ═══════════════════════════════════════════════════════════
    const OPT_COLS = ['Option Type', 'Status', 'Start Date', 'Expiration Date', 'Notice Date', 'Duration', 'Notes'];
    addBanner('OPTIONS', OPT_COLS.length);
    addSubHeaders(OPT_COLS);

    const options = findSections(lease.abstractedData!, 'OPTIONS');
    if (options.length > 0) {
        options.forEach(opt => addDataRow(OPT_COLS.map(h => fv(opt, h))));
    } else {
        addBlankDataRows(OPT_COLS.length);
    }
    rows.push([]);

    // ═══════════════════════════════════════════════════════════
    // 7.  CLAUSES  (3 logical columns, merged across 9 physical columns)
    // ═══════════════════════════════════════════════════════════
    addBanner('CLAUSES', 9);
    
    const rHeader = rows.length;
    addSubHeaders(['Name', 'Reference', 'Description', '', '', '', '', '', '']);
    merges.push({ s: { r: rHeader, c: 2 }, e: { r: rHeader, c: 8 } });

    const clauses = findSections(lease.abstractedData!, 'CLAUSES');
    if (clauses.length > 0) {
        clauses.forEach(cl => {
            const rData = rows.length;
            addDataRow([fv(cl, 'Name'), fv(cl, 'Reference'), fv(cl, 'Description'), '', '', '', '', '', '']);
            merges.push({ s: { r: rData, c: 2 }, e: { r: rData, c: 8 } });
        });
    } else {
        for (let i = 0; i < 6; i++) {
            const rData = rows.length;
            addDataRow(['', '', '', '', '', '', '', '', '']);
            merges.push({ s: { r: rData, c: 2 }, e: { r: rData, c: 8 } });
        }
    }

    // ── Build worksheet ────────────────────────────────────────
    const ws = xlsx.utils.aoa_to_sheet(rows);
    ws['!merges'] = merges;

    // Column widths matching screenshot proportions
    ws['!cols'] = [
        { wch: 18 }, // A
        { wch: 22 }, // B
        { wch: 16 }, // C
        { wch: 16 }, // D
        { wch: 14 }, // E
        { wch: 14 }, // F
        { wch: 12 }, // G
        { wch: 14 }, // H
        { wch: 14 }, // I
    ];

    // Apply all styles
    styled.forEach(({ r, c, s }) => {
        const addr = xlsx.utils.encode_cell({ r, c });
        if (ws[addr]) {
            ws[addr].s = s;
        } else {
            ws[addr] = { t: 's', v: '', s };
        }
    });

    return ws;
};

// ═══════════════════════════════════════════════════════════════════
// US / EU  TEMPLATE  (unchanged from original logic)
// ═══════════════════════════════════════════════════════════════════

const isBaseRentSection = (title: string): boolean => {
    const t = title.toLowerCase();
    return t.includes('base rent') || t.includes('rent charge') || t.includes('free rent');
};

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

const generateRentTableRows = (lease: Lease): any[][] => {
    const rentSections = (lease.abstractedData || [])
        .filter(s => isBaseRentSection(s.title))
        .sort((a, b) => getSortDate(a) - getSortDate(b));

    if (rentSections.length === 0) return [['No Base Rent extracted']];

    const tableRows: any[][] = [
        ['Rent Schedule', 'Start Date', 'End Date', 'Monthly Rent', 'Annual Rent']
    ];

    rentSections.forEach((section, index) => {
        let start = section.fields.find(f => f.label.toLowerCase().includes('start') || f.label.toLowerCase().includes('commencement'))?.value;
        let end = section.fields.find(f => f.label.toLowerCase().includes('end') || f.label.toLowerCase().includes('expiry'))?.value;
        let monthlyVal = section.fields.find(f => f.label.toLowerCase().includes('monthly') && f.label.toLowerCase().includes('amount'))?.value;
        let annualVal = section.fields.find(f => f.label.toLowerCase().includes('annual') && f.label.toLowerCase().includes('amount'))?.value;

        const cleanNumber = (val: string) => parseFloat(val.replace(/[^0-9.]/g, ''));
        const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

        const hasMonthly = monthlyVal && monthlyVal.trim() !== '' && monthlyVal.trim() !== '-';
        const hasAnnual = annualVal && annualVal.trim() !== '' && annualVal.trim() !== '-';

        if (hasMonthly && !hasAnnual) { const m = cleanNumber(monthlyVal!); if (!isNaN(m)) annualVal = formatMoney(m * 12); }
        else if (!hasMonthly && hasAnnual) { const a = cleanNumber(annualVal!); if (!isNaN(a)) monthlyVal = formatMoney(a / 12); }

        start = (start && start.trim() !== '') ? start : '-';
        end = (end && end.trim() !== '') ? end : '-';
        monthlyVal = (monthlyVal && monthlyVal.trim() !== '') ? monthlyVal : '-';
        annualVal = (annualVal && annualVal.trim() !== '') ? annualVal : '-';

        tableRows.push([`Base Rent ${index + 1}`, start, end, monthlyVal, annualVal]);
    });

    return tableRows;
};

const generateLeaseWorksheet = (lease: Lease): xlsx.WorkSheet | null => {
    if (!lease.abstractedData) return null;
    if (lease.templateType === 'custom') return generateCustomLeaseWorksheet(lease);

    const isBundle = (lease.documents?.length || 0) > 1;
    const rows: any[][] = [];
    const merges: any[] = [];
    const headerRowIndices: number[] = [];
    let baseRentRendered = false;

    const missingHeadings: string[] = lease.abstractedData
        .filter(s => s.fields.every(f => f.value === null || f.value === undefined || f.value.trim() === ''))
        .map(s => s.title);

    lease.abstractedData.forEach(section => {
        if (isBaseRentSection(section.title)) {
            if (!baseRentRendered) {
                if (rows.length > 0) rows.push([]);
                const rentTableHeaderIndex = rows.length;
                headerRowIndices.push(rentTableHeaderIndex);
                rows.push(['BASE RENT SCHEDULE']);
                merges.push({ s: { r: rentTableHeaderIndex, c: 0 }, e: { r: rentTableHeaderIndex, c: 4 } });
                generateRentTableRows(lease).forEach(r => rows.push(r));
                baseRentRendered = true;
            }
            return;
        }

        const validFields = section.fields.filter(field => field.value !== null && field.value !== undefined && field.value.trim() !== '');
        if (validFields.length === 0) return;
        if (rows.length > 0) rows.push([]);

        const headerRowIndex = rows.length;
        headerRowIndices.push(headerRowIndex);
        rows.push([section.title.toUpperCase()]);

        const colCount = isBundle ? 5 : 4;
        merges.push({ s: { r: headerRowIndex, c: 0 }, e: { r: headerRowIndex, c: colCount - 1 } });

        const colHeaders = ['Field', 'Extracted Value', 'Page Number', 'Source Snippet'];
        if (isBundle) colHeaders.push('File Name');
        rows.push(colHeaders);

        validFields.forEach(field => {
            const row = [field.label, field.value, field.page, field.snippet];
            if (isBundle) row.push(field.fileName);
            rows.push(row);
        });
    });

    rows.push([]);
    const missingHeaderIndex = rows.length;
    headerRowIndices.push(missingHeaderIndex);
    rows.push(['NOT FOUND IN THE LEASE']);
    merges.push({ s: { r: missingHeaderIndex, c: 0 }, e: { r: missingHeaderIndex, c: 4 } });
    if (missingHeadings.length > 0) missingHeadings.forEach(h => rows.push([h]));
    else rows.push(['None']);

    if (rows.length === 0) return null;

    const worksheet = xlsx.utils.aoa_to_sheet(rows);
    worksheet['!merges'] = merges;
    worksheet['!cols'] = [{ wch: 30 }, { wch: 40 }, { wch: 15 }, { wch: 50 }, { wch: 20 }];

    headerRowIndices.forEach(rowIndex => {
        const cellAddress = xlsx.utils.encode_cell({ r: rowIndex, c: 0 });
        if (!worksheet[cellAddress]) return;
        worksheet[cellAddress].s = {
            fill: { fgColor: { rgb: 'BDD7EE' } },
            font: { bold: true, sz: 12 },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: thinBorder,
        };
    });

    return worksheet;
};

// ═══════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════

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
            const safeName = `${lease.name.substring(0, 24)}_${lease.id}`.replace(/[:\\\\/?*[\]]/g, '').substring(0, 31);
            xlsx.utils.book_append_sheet(workbook, worksheet, safeName);
        }
    });
    if (workbook.SheetNames.length > 0) xlsx.writeFile(workbook, 'All_Reports.xlsx');
};
