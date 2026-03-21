import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

export interface ExportTableData {
    headers: string[];
    rows: (string | number)[][];
}

export interface PDFExportOptions {
    title: string;
    subtitle?: string;
    tables: {
        title: string;
        data: ExportTableData;
    }[];
    filename?: string;
}

export class ExportService {
    /**
     * Standardizes CSV exports with consistent headers and data formatting.
     */
    static toCSV(data: any[], headers: string[], filename: string = 'export.csv') {
        const csvContent = [
            headers.join(','),
            ...data.map(item => 
                headers.map(h => {
                    const val = item[h.toLowerCase().replace(/ /g, '_')] || '';
                    return `"${String(val).replace(/"/g, '""')}"`;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, filename);
    }

    /**
     * Generates a world-class, premium PDF report for business intelligence.
     */
    static async toPDF(options: PDFExportOptions) {
        // @ts-ignore - autoTable is added by jspdf-autotable
        const doc = new jsPDF() as any;
        const timestamp = new Date().toLocaleString();

        // 1. Institutional Header (Crystalline Style)
        doc.setFillColor(15, 23, 42); // Slate 950
        doc.rect(0, 0, 210, 45, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(26);
        doc.text(options.title.toUpperCase(), 20, 25);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(options.subtitle || 'Business Performance Artifact', 20, 33);
        doc.text(`Generated on ${timestamp}`, 20, 38);

        let currentY = 60;

        // 2. Iterate Tables
        for (const table of options.tables) {
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(table.title, 20, currentY);

            // Import autotable dynamically to avoid SSR issues if used in client
            const { default: autoTable } = await import('jspdf-autotable');
            
            autoTable(doc, {
                startY: currentY + 5,
                head: [table.data.headers],
                body: table.data.rows,
                theme: 'striped',
                headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { left: 20, right: 20 },
                styles: { fontSize: 9, cellPadding: 4 }
            });

            currentY = doc.lastAutoTable.finalY + 20;

            // Page break check
            if (currentY > 260) {
                doc.addPage();
                currentY = 20;
            }
        }

        // 3. Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184); // slate 400
            doc.text(
                `SOLO SME Technical Artifact — Page ${i} of ${pageCount}`,
                20,
                285
            );
        }

        const filename = options.filename || `${options.title.toLowerCase().replace(/ /g, '_')}_${new Date().getTime()}.pdf`;
        doc.save(filename);
    }
}
