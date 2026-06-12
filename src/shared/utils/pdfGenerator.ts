
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Lease, AbstractedSection } from '@/shared/types';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS matching the reference screenshot exactly
// ═══════════════════════════════════════════════════════════════════

const NAVY: [number, number, number]      = [26, 35, 58];    // #1A233A
const GREY_SUB: [number, number, number]   = [217, 217, 217]; // #D9D9D9
const WHITE: [number, number, number]      = [255, 255, 255];
const BLACK: [number, number, number]      = [0, 0, 0];
const BRANDING_TEXT: [number, number, number] = [150, 150, 150];

const LOGO_HORIZONTAL_URL = 'https://firebasestorage.googleapis.com/v0/b/penaki-12292.firebasestorage.app/o/brand-assets%2Fpenaki%2Flogo-horizontal.svg?alt=media&token=19ab475c-9ea2-40f0-86dd-c482e05a6d21';
const LOGO_ICON_URL = 'https://firebasestorage.googleapis.com/v0/b/penaki-12292.firebasestorage.app/o/brand-assets%2Fpenaki%2Flogo-icon.svg?alt=media&token=0af4d222-2d24-4c10-8aa3-b86e8f0fd0f7';

const getBase64ImageFromURL = (url: string): Promise<string> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.width; c.height = img.height;
            const ctx = c.getContext('2d');
            if (ctx) { ctx.drawImage(img, 0, 0); resolve(c.toDataURL('image/png')); }
            else reject(new Error('Canvas context is null'));
        };
        img.onerror = reject;
        img.src = url;
    });

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

const fv = (sec: AbstractedSection | undefined, label: string): string =>
    sec?.fields.find(f => f.label.toUpperCase() === label.toUpperCase())?.value || '';

const findSections = (data: AbstractedSection[], prefix: string) =>
    data.filter(s => s.title.toUpperCase().startsWith(prefix.toUpperCase()));

const isBaseRentSection = (title: string): boolean => {
    const t = title.toLowerCase();
    return t.includes('base rent') || t.includes('rent charge') || t.includes('free rent');
};

const getSortDate = (section: AbstractedSection): number => {
    const sf = section.fields.find(f =>
        f.label.toLowerCase().includes('start') || f.label.toLowerCase().includes('commencement')
    );
    if (sf?.value) { const d = new Date(sf.value); return isNaN(d.getTime()) ? 0 : d.getTime(); }
    return 0;
};

// ═══════════════════════════════════════════════════════════════════
// autoTable style presets for the custom template
// ═══════════════════════════════════════════════════════════════════

const bannerStyle = {
    halign: 'center' as const,
    fillColor: NAVY,
    textColor: WHITE,
    fontStyle: 'bold' as const,
    fontSize: 8,
    lineWidth: 0.2,
    lineColor: BLACK,
    cellPadding: 1.5,
};

const subHeaderStyle = {
    fillColor: GREY_SUB,
    textColor: BLACK,
    fontStyle: 'bold' as const,
    fontSize: 7,
    halign: 'center' as const,
    lineWidth: 0.2,
    lineColor: BLACK,
    cellPadding: 1.5,
};

const bodyCellStyle = {
    fontSize: 7,
    cellPadding: 1.2,
    lineColor: BLACK,
    lineWidth: 0.2,
    textColor: BLACK,
    overflow: 'linebreak' as const,
    valign: 'top' as const,
};

const labelCellStyle = {
    ...bodyCellStyle,
    fontStyle: 'bold' as const,
};

// ═══════════════════════════════════════════════════════════════════
// CUSTOM TEMPLATE PDF  –  Exact clone of the reference A4 layout
// ═══════════════════════════════════════════════════════════════════

const generateCustomLeasePdf = async (lease: Lease, doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.width;
    let y = 15;

    // ── Title ──────────────────────────────────────────────────
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.text(`LEASE ABSTRACT - ${lease.name.toUpperCase()}`, 15, y);
    y += 8;

    const margin = { left: 15, right: 15 };
    const tableWidth = pageWidth - margin.left - margin.right;

    // Helper: draw a section table with banner + sub-headers + data
    const drawTable = (
        title: string,
        headers: string[],
        bodyRows: string[][],
        columnWidths?: { [key: number]: { cellWidth: number } },
    ) => {
        const bannerRow = [{ content: title, colSpan: headers.length, styles: bannerStyle }];
        const subRow = headers;

        autoTable(doc, {
            startY: y,
            head: [bannerRow, subRow],
            body: bodyRows.length > 0 ? bodyRows : [headers.map(() => '')],
            theme: 'plain',
            styles: bodyCellStyle,
            headStyles: subHeaderStyle,
            columnStyles: columnWidths,
            margin,
            pageBreak: 'auto',
            didDrawPage: (data) => { y = data.cursor?.y ? data.cursor.y + 5 : y + 5; },
        });
    };

    // ═══════════════════════════════════════════════════════════
    // 1.  LEASE INFORMATION  (key-value pairs, 2-column layout)
    // ═══════════════════════════════════════════════════════════
    const li = lease.abstractedData!.find(s => s.title.toUpperCase() === 'LEASE INFORMATION');

    const liPairs: [string, string, string, string][] = [
        ['Type',            fv(li, 'Type'),            'Lease',            fv(li, 'Lease')],
        ['Status',          fv(li, 'Status'),          'Property',         fv(li, 'Property')],
        ['Duration',        fv(li, 'Duration'),        'Property Address', fv(li, 'Prop. Address') || fv(li, 'Property Address')],
        ['From',            fv(li, 'From'),            'Landlord',         fv(li, 'Landlord')],
        ['To',              fv(li, 'To'),              'L. Address',       fv(li, 'L. Address')],
        ['Effective Date',  fv(li, 'Effective Date'),  'Tenant',           fv(li, 'Tenant')],
        ['Contracted Area', fv(li, 'Contracted Area'), 'T. Address',       fv(li, 'T. Address')],
    ];

    const liBanner = [{ content: 'LEASE INFORMATION', colSpan: 4, styles: bannerStyle }];
    autoTable(doc, {
        startY: y,
        head: [liBanner],
        body: liPairs,
        theme: 'plain',
        styles: bodyCellStyle,
        headStyles: subHeaderStyle,
        columnStyles: {
            0: { ...labelCellStyle, cellWidth: tableWidth * 0.12 },
            1: { ...bodyCellStyle, cellWidth: tableWidth * 0.38 },
            2: { ...labelCellStyle, cellWidth: tableWidth * 0.15 },
            3: { ...bodyCellStyle, cellWidth: tableWidth * 0.35 },
        },
        margin,
        pageBreak: 'auto',
        didDrawPage: (data) => { y = data.cursor?.y ? data.cursor.y + 5 : y + 5; },
    });

    // ═══════════════════════════════════════════════════════════
    // 2.  SPACE
    // ═══════════════════════════════════════════════════════════
    const SPACE_COLS = ['Unit', 'Floor', 'Status', 'Area'];
    const spaces = findSections(lease.abstractedData!, 'SPACE');
    const spaceRows = spaces.length > 0 ? spaces.map(sp => SPACE_COLS.map(h => fv(sp, h))) : [];
    drawTable('SPACE', SPACE_COLS, spaceRows);

    // ═══════════════════════════════════════════════════════════
    // 3.  RENT SCHEDULE
    // ═══════════════════════════════════════════════════════════
    const CS_COLS = ['Charge type', 'description', 'Date From', 'Date To', 'Monthly Amt', 'Annual Amt', 'Area', 'Amt Per Area', 'Mgmt Fees'];
    const charges = findSections(lease.abstractedData!, 'RENT SCHEDULE');
    const csRows = charges.length > 0 ? charges.map(ch => [
        fv(ch, 'Charge type'), fv(ch, 'Description'), fv(ch, 'Date From'), fv(ch, 'Date To'),
        fv(ch, 'Monthly Amt'), fv(ch, 'Annual Amt'), fv(ch, 'Area'), fv(ch, 'Amt Per Area'), fv(ch, 'Mgmt Fees'),
    ]) : [];
    drawTable('RENT SCHEDULE', CS_COLS, csRows);

    // ═══════════════════════════════════════════════════════════
    // 4.  RECOVERY
    // ═══════════════════════════════════════════════════════════
    const REC_COLS = ['Recovery Type', 'Description', 'From', 'To', 'EOY Month', 'Base Year', 'Base Amt', 'Pro Rata %', 'CAM Cap%'];
    const recoveries = findSections(lease.abstractedData!, 'RECOVERY');
    const recRows = recoveries.length > 0 ? recoveries.map(rc => REC_COLS.map(h => fv(rc, h))) : [];
    drawTable('RECOVERY', REC_COLS, recRows);

    // ═══════════════════════════════════════════════════════════
    // 5.  LATE FEE
    // ═══════════════════════════════════════════════════════════
    const LF_COLS = ['Serial no.', 'Grace Period', 'Late Fee Type', 'Late Fee Amount / %', 'Daily Fee'];
    const lateFees = findSections(lease.abstractedData!, 'LATE FEE');
    const lfRows = lateFees.length > 0 ? lateFees.map((lf, idx) => [
        String(idx), fv(lf, 'Grace Period'), fv(lf, 'Late Fee Type'), fv(lf, 'Late Fee Amount / %'), fv(lf, 'Daily Fee'),
    ]) : [];
    drawTable('LATE FEE', LF_COLS, lfRows);

    // ═══════════════════════════════════════════════════════════
    // 6.  OPTIONS
    // ═══════════════════════════════════════════════════════════
    const OPT_COLS = ['Option Type', 'Status', 'Start Date', 'Expiration Date', 'Notice Date', 'Duration', 'Notes'];
    const options = findSections(lease.abstractedData!, 'OPTIONS');
    const optRows = options.length > 0 ? options.map(opt => OPT_COLS.map(h => fv(opt, h))) : [];
    drawTable('OPTIONS', OPT_COLS, optRows);

    // ═══════════════════════════════════════════════════════════
    // 7.  CLAUSES  (wide Description column)
    // ═══════════════════════════════════════════════════════════
    const CL_COLS = ['Name', 'Reference', 'Description'];
    const clauses = findSections(lease.abstractedData!, 'CLAUSES');
    const clRows = clauses.length > 0 ? clauses.map(cl => CL_COLS.map(h => fv(cl, h))) : [];
    drawTable('CLAUSES', CL_COLS, clRows, {
        0: { cellWidth: tableWidth * 0.18 },
        1: { cellWidth: tableWidth * 0.12 },
        2: { cellWidth: tableWidth * 0.70 },
    });
};

// ═══════════════════════════════════════════════════════════════════
// US / EU TEMPLATE PDF  (original logic preserved)
// ═══════════════════════════════════════════════════════════════════

const COLORS_LEGACY = {
    HEADER_BG: [100, 100, 100] as [number, number, number],
    SECTION_BG: [189, 215, 238] as [number, number, number],
    TEXT_MAIN: [0, 0, 0] as [number, number, number],
};

export const generateSingleLeasePdf = async (lease: Lease) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    const [logoHorizontalRes, logoIconRes] = await Promise.allSettled([
        getBase64ImageFromURL(LOGO_HORIZONTAL_URL),
        getBase64ImageFromURL(LOGO_ICON_URL)
    ]);

    const logoHorizontal = logoHorizontalRes.status === 'fulfilled' ? logoHorizontalRes.value : null;
    const logoIcon = logoIconRes.status === 'fulfilled' ? logoIconRes.value : null;

    // ── Branch: Custom template uses completely different layout ──
    if (lease.templateType === 'custom') {
        await generateCustomLeasePdf(lease, doc);

        // Post-processing: watermarks & footers
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            if (logoIcon) {
                const gState = new (doc as any).GState({ opacity: 0.08 });
                doc.setGState(gState);
                const imgSize = 40;
                doc.addImage(logoIcon, 'PNG', (pageWidth - imgSize) / 2, (pageHeight - imgSize) / 2, imgSize, imgSize);
                doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
            }
            doc.setFontSize(6);
            doc.setTextColor(BRANDING_TEXT[0], BRANDING_TEXT[1], BRANDING_TEXT[2]);
            doc.setFont('helvetica', 'italic');
            doc.text(lease.name, 15, pageHeight - 8);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - 25, pageHeight - 8);
        }

        const safeName = `${lease.name.substring(0, 24)}_${lease.id}`.replace(/[:\\\\/?*[\]]/g, '').substring(0, 31);
        doc.save(`Abstract_${safeName}.pdf`);
        return;
    }

    // ── US/EU template (original code below) ──

    if (logoHorizontal) {
        doc.addImage(logoHorizontal, 'PNG', 15, 8, 30, 8);
    } else {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS_LEGACY.TEXT_MAIN[0], COLORS_LEGACY.TEXT_MAIN[1], COLORS_LEGACY.TEXT_MAIN[2]);
        // doc.text('Penaki', 15, 12);
    }

    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    const today = new Date().toLocaleDateString();
    const rightMargin = pageWidth - 15;
    doc.text(`Date: ${today}`, rightMargin, 10, { align: 'right' });
    doc.text(`Lease ID: ${lease.id}`, rightMargin, 14, { align: 'right' });

    doc.setFillColor(COLORS_LEGACY.HEADER_BG[0], COLORS_LEGACY.HEADER_BG[1], COLORS_LEGACY.HEADER_BG[2]);
    doc.rect(15, 17, pageWidth - 30, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`LEASE ABSTRACT - ${lease.name.toUpperCase()}`, pageWidth / 2, 21, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    // Removed redundant lease name line

    let currentY = 32;

    if (lease.abstractedData) {
        let baseRentRendered = false;

        const missingHeadings = lease.abstractedData
            .filter(s => s.fields.every(f => f.value === null || f.value === undefined || f.value.trim() === ''))
            .map(s => s.title);

        lease.abstractedData.forEach(section => {
            if (isBaseRentSection(section.title)) {
                if (!baseRentRendered) {
                    const rentSections = lease.abstractedData!
                        .filter(s => isBaseRentSection(s.title))
                        .sort((a, b) => getSortDate(a) - getSortDate(b));

                    if (rentSections.length > 0) {
                        if (currentY > pageHeight - 30) { doc.addPage(); currentY = 20; }

                        const tableData = rentSections.map((s, index) => {
                            let start = s.fields.find(f => f.label.toLowerCase().includes('start') || f.label.toLowerCase().includes('commencement'))?.value;
                            let end = s.fields.find(f => f.label.toLowerCase().includes('end') || f.label.toLowerCase().includes('expiry'))?.value;
                            let monthlyVal = s.fields.find(f => f.label.toLowerCase().includes('monthly') && f.label.toLowerCase().includes('amount'))?.value;
                            let annualVal = s.fields.find(f => f.label.toLowerCase().includes('annual') && f.label.toLowerCase().includes('amount'))?.value;

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

                            return [`Base Rent ${index + 1}`, start, end, monthlyVal, annualVal];
                        });

                        autoTable(doc, {
                            startY: currentY,
                            head: [
                                [{ content: 'BASE RENT SCHEDULE', colSpan: 5, styles: { halign: 'center', fillColor: COLORS_LEGACY.SECTION_BG, textColor: BLACK, fontStyle: 'bold', lineWidth: 0.1, lineColor: BLACK } }],
                                ['Rent Schedule', 'Start Date', 'End Date', 'Monthly Rent', 'Annual Rent']
                            ],
                            body: tableData,
                            theme: 'plain',
                            showHead: 'firstPage',
                            styles: { fontSize: 7, cellPadding: 1.5, lineColor: [200, 200, 200], lineWidth: 0.1, textColor: BLACK, halign: 'center' },
                            headStyles: { fillColor: [240, 240, 240], textColor: BLACK, fontStyle: 'bold', halign: 'center', lineWidth: 0.1, lineColor: BLACK, fontSize: 8 },
                            didDrawPage: (data) => { currentY = data.cursor?.y ? data.cursor.y + 4 : 0; },
                            margin: { top: 20, bottom: 15, left: 15, right: 15 },
                            pageBreak: 'auto'
                        });
                        baseRentRendered = true;
                    }
                }
                return;
            }

            const validFields = section.fields.filter(f => f.value !== null && f.value !== undefined && String(f.value).trim() !== '');
            if (validFields.length === 0) return;

            const bodyData = validFields.map(field => [field.label, field.value || '']);

            autoTable(doc, {
                startY: currentY,
                head: [[{
                    content: section.title.toUpperCase(),
                    colSpan: 2,
                    styles: { halign: 'center', fillColor: COLORS_LEGACY.SECTION_BG, textColor: BLACK, fontStyle: 'bold', lineWidth: 0.1, lineColor: BLACK }
                }]],
                body: bodyData,
                theme: 'plain',
                showHead: 'firstPage',
                styles: { fontSize: 7, cellPadding: 1.5, lineColor: [200, 200, 200], lineWidth: 0.1, textColor: BLACK },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
                headStyles: { fillColor: COLORS_LEGACY.SECTION_BG, textColor: BLACK, fontStyle: 'bold', halign: 'center', fontSize: 8 },
                didDrawPage: (data) => { currentY = data.cursor?.y ? data.cursor.y + 4 : 0; },
                margin: { top: 20, bottom: 15, left: 15, right: 15 },
                pageBreak: 'auto'
            });
        });

        if (missingHeadings.length > 0) {
            if (currentY > pageHeight - 30) { doc.addPage(); currentY = 20; }
            autoTable(doc, {
                startY: currentY,
                head: [[{ content: 'NOT FOUND IN THE LEASE', colSpan: 1, styles: { halign: 'center', fillColor: COLORS_LEGACY.SECTION_BG, textColor: BLACK, fontStyle: 'bold', lineWidth: 0.1, lineColor: BLACK } }]],
                body: missingHeadings.map(h => [h]),
                theme: 'plain',
                showHead: 'firstPage',
                styles: { fontSize: 7, cellPadding: 1.5, lineColor: [200, 200, 200], lineWidth: 0.1, textColor: [100, 100, 100], fontStyle: 'italic' },
                headStyles: { fontSize: 8 },
                didDrawPage: (data) => { currentY = data.cursor?.y ? data.cursor.y + 4 : 0; },
                margin: { top: 20, bottom: 15, left: 15, right: 15 },
                pageBreak: 'auto'
            });
        }
    }

    // Post-processing
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        if (logoIcon) {
            const gState = new (doc as any).GState({ opacity: 0.08 });
            doc.setGState(gState);
            const imgSize = 40;
            doc.addImage(logoIcon, 'PNG', (pageWidth - imgSize) / 2, (pageHeight - imgSize) / 2, imgSize, imgSize);
            doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
        }
        doc.setFontSize(6);
        doc.setTextColor(BRANDING_TEXT[0], BRANDING_TEXT[1], BRANDING_TEXT[2]);
        doc.setFont('helvetica', 'italic');
        doc.text(lease.name, 15, pageHeight - 8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 25, pageHeight - 8);
    }

    const safeName = `${lease.name.substring(0, 24)}_${lease.id}`.replace(/[:\\\\/?*[\]]/g, '').substring(0, 31);
    doc.save(`Abstract_${safeName}.pdf`);
};
