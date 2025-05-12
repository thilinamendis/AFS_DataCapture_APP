import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (title, data, columns, filename, type) => {
    try {
        // Create PDF document
        const doc = new jsPDF();
        
        // Define premium colors
        const primaryColor = [41, 128, 185]; // Professional blue
        const secondaryColor = [44, 62, 80]; // Dark slate
        const accentColor = [231, 76, 60]; // Red accent
        const lightGray = [245, 245, 245];
        const darkGray = [108, 117, 125];

        // Add premium header with gradient effect
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F');
        
        // Add company logo/name with shadow effect
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text('A.F.S', 105, 25, { align: 'center' });
        
        // Add subtitle
        doc.setFontSize(12);
        doc.setFont("helvetica", "italic");
        doc.text('Advanced Facility Solutions', 105, 35, { align: 'center' });

        // Add title section with decorative line
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, 50, 190, 50);
        
        doc.setTextColor(...secondaryColor);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(title, 105, 65, { align: 'center' });

        // Add generation date with icon
        doc.setFontSize(10);
        doc.setTextColor(...darkGray);
        doc.setFont("helvetica", "normal");
        const dateText = `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
        doc.text(dateText, 105, 75, { align: 'center' });

        // Add decorative separator
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.2);
        doc.line(20, 80, 190, 80);

        // Prepare data for the table
        const tableData = data.map(item => columns.map(col => col.accessor(item)));

        // Configure column styles based on management type
        let columnStyles = {};
        const pageWidth = 210; // A4 width in mm
        const margin = 20; // Total margin (left + right)
        const availableWidth = pageWidth - margin;

        switch (type) {
            case 'users':
                columnStyles = {
                    0: { cellWidth: '15%' }, // User ID
                    1: { cellWidth: '25%' }, // Name
                    2: { cellWidth: '30%' }, // Email
                    3: { cellWidth: '10%' }, // Role
                    4: { cellWidth: '20%' }  // Joined Date
                };
                break;
            case 'appointments':
                columnStyles = {
                    0: { cellWidth: '15%' }, // Appointment ID
                    1: { cellWidth: '25%' }, // Customer
                    2: { cellWidth: '20%' }, // Service
                    3: { cellWidth: '25%' }, // Date & Time
                    4: { cellWidth: '15%' }  // Status
                };
                break;
            case 'orders':
                columnStyles = {
                    0: { cellWidth: '15%' }, // Order ID
                    1: { cellWidth: '25%' }, // Customer
                    2: { cellWidth: '20%' }, // Total Amount
                    3: { cellWidth: '15%' }, // Status
                    4: { cellWidth: '25%' }  // Order Date
                };
                break;
            case 'services':
                columnStyles = {
                    0: { cellWidth: '15%' }, // Service ID
                    1: { cellWidth: '25%' }, // Customer
                    2: { cellWidth: '20%' }, // Service Type
                    3: { cellWidth: '25%' }, // Date & Time
                    4: { cellWidth: '15%' }  // Status
                };
                break;
            case 'products':
                columnStyles = {
                    0: { cellWidth: '30%' }, // Product Name
                    1: { cellWidth: '20%' }, // Category
                    2: { cellWidth: '15%' }, // Price
                    3: { cellWidth: '20%' }, // Rating
                    4: { cellWidth: '15%' }  // Status
                };
                break;
            case 'workorder':
                columnStyles = {
                    0: { 
                        cellWidth: '40%',
                        fontStyle: 'bold',
                        fillColor: lightGray,
                        textColor: secondaryColor
                    },
                    1: { 
                        cellWidth: '60%',
                        fillColor: [255, 255, 255]
                    }
                };
                break;
            default:
                columnStyles = {
                    0: { cellWidth: '20%' },
                    1: { cellWidth: '20%' },
                    2: { cellWidth: '20%' },
                    3: { cellWidth: '20%' },
                    4: { cellWidth: '20%' }
                };
        }

        // Add table using autoTable with premium styling
        autoTable(doc, {
            startY: 90,
            head: [columns.map(col => col.header)],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: primaryColor,
                textColor: 255,
                fontSize: 12,
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle',
                cellPadding: 8,
                lineWidth: 0.1,
                lineColor: [255, 255, 255]
            },
            styles: {
                fontSize: 10,
                cellPadding: 6,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle',
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
                font: 'helvetica'
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            },
            columnStyles: columnStyles,
            margin: { top: 90, right: 15, bottom: 15, left: 15 },
            tableWidth: '100%',
            showFoot: 'lastPage',
            footStyles: {
                fillColor: secondaryColor,
                textColor: 255,
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center',
                cellPadding: 5
            },
            foot: [['Total Records: ' + data.length]],
            didDrawPage: function(data) {
                // Add page number
                doc.setFontSize(10);
                doc.setTextColor(...darkGray);
                doc.text(
                    `Page ${data.pageCount} of ${data.pageNumber}`,
                    data.settings.margin.left,
                    doc.internal.pageSize.height - 10
                );
            }
        });

        // Add footer with company information
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Add footer line
            doc.setDrawColor(...primaryColor);
            doc.setLineWidth(0.2);
            doc.line(20, doc.internal.pageSize.height - 20, 190, doc.internal.pageSize.height - 20);
            
            // Add company information
            doc.setFontSize(8);
            doc.setTextColor(...darkGray);
            doc.text('A.F.S - Advanced Facility Solutions', 105, doc.internal.pageSize.height - 15, { align: 'center' });
            doc.text('Professional Facility Management Services', 105, doc.internal.pageSize.height - 10, { align: 'center' });
        }

        // Save the PDF
        doc.save(filename);

        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
}; 