
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Lease, AbstractedSection } from '@/shared/types';

// Constants for styling
const COLORS = {
    HEADER_BG: [100, 100, 100] as [number, number, number], // Dark Grey for Main Title
    SECTION_BG: [189, 215, 238] as [number, number, number], // Light Blue for Section Headers (#BDD7EE)
    TEXT_MAIN: [0, 0, 0] as [number, number, number],
    BRANDING_TEXT: [150, 150, 150] as [number, number, number]
};

const LOGO_HORIZONTAL_URL = 'https://firebasestorage.googleapis.com/v0/b/penaki-12292.firebasestorage.app/o/brand-assets%2Fpenaki%2Flogo-horizontal.svg?alt=media&token=19ab475c-9ea2-40f0-86dd-c482e05a6d21';
const LOGO_ICON_URL = 'https://firebasestorage.googleapis.com/v0/b/penaki-12292.firebasestorage.app/o/brand-assets%2Fpenaki%2Flogo-icon.svg?alt=media&token=0af4d222-2d24-4c10-8aa3-b86e8f0fd0f7';

// Helper to load image and convert to base64
const getBase64ImageFromURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            // Set canvas dimensions to image dimensions to maintain quality
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL("image/png");
                resolve(dataURL);
            } else {
                reject(new Error("Canvas context is null"));
            }
        };
        img.onerror = (error) => reject(error);
        img.src = url;
    });
};

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

export const generateSingleLeasePdf = async (lease: Lease) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- Pre-load Assets ---
    // We try to load both images. If one fails, we get undefined for that one.
    const [logoHorizontalRes, logoIconRes] = await Promise.allSettled([
        getBase64ImageFromURL(LOGO_HORIZONTAL_URL),
        getBase64ImageFromURL(LOGO_ICON_URL)
    ]);

    const logoHorizontal = logoHorizontalRes.status === 'fulfilled' ? logoHorizontalRes.value : null;
    const logoIcon = logoIconRes.status === 'fulfilled' ? logoIconRes.value : null;

    // --- 1. Branding Header (Logo & Meta) ---
    if (logoHorizontal) {
        // Add horizontal logo at top left (x=15, y=8, w=30, h=8 - adjusted for aspect)
        doc.addImage(logoHorizontal, 'PNG', 15, 8, 30, 8); 
    } else {
        // Fallback text if logo fails
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(COLORS.TEXT_MAIN[0], COLORS.TEXT_MAIN[1], COLORS.TEXT_MAIN[2]);
        doc.text("Penaki", 15, 12);
    }

    // Right Side Meta Data (Lease ID and Date) - Reduced Font
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    const today = new Date().toLocaleDateString();
    
    // Right align calculation
    const rightMargin = pageWidth - 15;
    
    doc.text(`Date: ${today}`, rightMargin, 10, { align: 'right' });
    doc.text(`Lease ID: ${lease.id}`, rightMargin, 14, { align: 'right' });

    // --- 2. Title Bar ---
    // Moved down slightly to accommodate header logo
    doc.setFillColor(COLORS.HEADER_BG[0], COLORS.HEADER_BG[1], COLORS.HEADER_BG[2]);
    doc.rect(15, 17, pageWidth - 30, 6, 'F');
    
    // Add "LEASE ABSTRACT" text centered in bar
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("LEASE ABSTRACT", pageWidth / 2, 21, { align: 'center' });

    // --- 3. Lease Name Sub-Header ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(lease.name, pageWidth / 2, 28, { align: 'center' });

    let currentY = 32;

    if (lease.abstractedData) {
        let baseRentRendered = false;

        const missingHeadings = lease.abstractedData
            .filter(s => s.fields.every(f => f.value === null || f.value === undefined || f.value.trim() === ''))
            .map(s => s.title);

        // Iterate ALL sections to maintain template order
        lease.abstractedData.forEach(section => {
            
            // --- 1. HANDLE BASE RENT ---
            if (isBaseRentSection(section.title)) {
                if (!baseRentRendered) {
                    const rentSections = lease.abstractedData
                        .filter(s => isBaseRentSection(s.title))
                        .sort((a, b) => getSortDate(a) - getSortDate(b));

                    if (rentSections.length > 0) {
                        // Check page break
                        if (currentY > pageHeight - 30) {
                            doc.addPage();
                            currentY = 20;
                        }

                        const tableData = rentSections.map((s, index) => {
                            let start = s.fields.find(f => f.label.toLowerCase().includes('start') || f.label.toLowerCase().includes('commencement'))?.value;
                            let end = s.fields.find(f => f.label.toLowerCase().includes('end') || f.label.toLowerCase().includes('expiry'))?.value;
                            
                            let monthlyVal = s.fields.find(f => f.label.toLowerCase().includes('monthly') && f.label.toLowerCase().includes('amount'))?.value;
                            let annualVal = s.fields.find(f => f.label.toLowerCase().includes('annual') && f.label.toLowerCase().includes('amount'))?.value;

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

                            return [`Base Rent ${index + 1}`, start, end, monthlyVal, annualVal];
                        });

                        autoTable(doc, {
                            startY: currentY,
                            head: [
                                [{ content: 'BASE RENT SCHEDULE', colSpan: 5, styles: { halign: 'center', fillColor: COLORS.SECTION_BG, textColor: [0,0,0], fontStyle: 'bold', lineWidth: 0.1, lineColor: [0,0,0] } }],
                                ['Rent Schedule', 'Start Date', 'End Date', 'Monthly Rent', 'Annual Rent']
                            ],
                            body: tableData,
                            theme: 'plain',
                            showHead: 'firstPage',
                            styles: { fontSize: 7, cellPadding: 1.5, lineColor: [200, 200, 200], lineWidth: 0.1, textColor: [0, 0, 0], halign: 'center' },
                            headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], fontStyle: 'bold', halign: 'center', lineWidth: 0.1, lineColor: [0,0,0], fontSize: 8 },
                            didDrawPage: (data) => { currentY = data.cursor?.y ? data.cursor.y + 4 : 0; },
                            margin: { top: 20, bottom: 15, left: 15, right: 15 },
                            pageBreak: 'auto'
                        });
                        baseRentRendered = true;
                    }
                }
                return;
            }

            // --- 2. HANDLE REGULAR SECTIONS ---
            // Filter empty fields for cleaner PDF
            const validFields = section.fields.filter(f => f.value !== null && f.value !== undefined && String(f.value).trim() !== '');
            
            if (validFields.length === 0) return;

            // Prepare table data
            const bodyData = validFields.map(field => [field.label, field.value || '']);

            autoTable(doc, {
                startY: currentY,
                head: [[{ 
                    content: section.title.toUpperCase(), 
                    colSpan: 2, 
                    styles: { 
                        halign: 'center', 
                        fillColor: COLORS.SECTION_BG, 
                        textColor: [0, 0, 0],
                        fontStyle: 'bold',
                        lineWidth: 0.1,
                        lineColor: [0, 0, 0] // Black border for header
                    } 
                }]],
                body: bodyData,
                theme: 'plain',
                showHead: 'firstPage',
                styles: {
                    fontSize: 7,
                    cellPadding: 1.5,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1,
                    textColor: [0, 0, 0]
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 50 }, // Reduced Label column width
                    1: { } // Value column takes remaining
                },
                headStyles: {
                    fillColor: COLORS.SECTION_BG,
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'center',
                    fontSize: 8
                },
                didDrawPage: (data) => {
                    // Update currentY for next table if on same page
                    currentY = data.cursor?.y ? data.cursor.y + 4 : 0;
                },
                margin: { top: 20, bottom: 15, left: 15, right: 15 }, // Reduced margins
                pageBreak: 'auto'
            });
        });

        // --- 3. MISSING HEADINGS (Always at the end) ---
        if (missingHeadings.length > 0) {
            // Check page break
            if (currentY > pageHeight - 30) {
                doc.addPage();
                currentY = 20;
            }

            const missingData = missingHeadings.map(h => [h]);

            autoTable(doc, {
                startY: currentY,
                head: [[{ 
                    content: 'NOT FOUND IN THE LEASE', 
                    colSpan: 1, 
                    styles: { 
                        halign: 'center', 
                        fillColor: COLORS.SECTION_BG, 
                        textColor: [0, 0, 0],
                        fontStyle: 'bold',
                        lineWidth: 0.1,
                        lineColor: [0, 0, 0]
                    } 
                }]],
                body: missingData,
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

    // --- 4. POST-PROCESSING: Watermarks & Footers (On Every Page) ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // 4a. Watermark (Centered, Low Opacity)
        if (logoIcon) {
            // Set Graphic State for transparency
            // Note: jsPDF type definition might need 'any' cast if GState isn't fully typed in the version used
            const gState = new (doc as any).GState({ opacity: 0.08 });
            doc.setGState(gState);

            const imgSize = 40; // mm
            const x = (pageWidth - imgSize) / 2;
            const y = (pageHeight - imgSize) / 2;
            
            doc.addImage(logoIcon, 'PNG', x, y, imgSize, imgSize);

            // Reset Graphic State
            const resetGState = new (doc as any).GState({ opacity: 1.0 });
            doc.setGState(resetGState);
        }

        // 4b. Footer
        doc.setFontSize(6);
        doc.setTextColor(COLORS.BRANDING_TEXT[0], COLORS.BRANDING_TEXT[1], COLORS.BRANDING_TEXT[2]);
        doc.setFont("helvetica", "italic");
        doc.text(`Penaki | ${lease.name} (${lease.id})`, 15, pageHeight - 8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 25, pageHeight - 8);
    }
    
    // Save file
    const safeName = `${lease.name.substring(0, 24)}_${lease.id}`.replace(/[:\\/?*[\]]/g, '').substring(0, 31);
    doc.save(`Abstract_${safeName}.pdf`);
};
