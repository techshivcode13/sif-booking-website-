const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a receipt PDF matching the SIF receipt template
 * @param {Object} bookingData - Booking information
 * @returns {Buffer} - PDF buffer
 */
function generateReceipt(bookingData) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 40, bottom: 40, left: 50, right: 50 }
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);

            // Page dimensions
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;

            // Draw outer border (thick black rectangle)
            doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
                .lineWidth(3)
                .stroke();

            // --- HEADER SECTION ---
            const headerY = 50;

            // Add new full header image (contains Logo, Group, Stamp)
            const headerImagePath = path.join(__dirname, '../../assets/receipt-header-v2.jpg');
            if (fs.existsSync(headerImagePath)) {
                // Fit the header image within margins, keeping aspect ratio
                doc.image(headerImagePath, 40, 40, { width: pageWidth - 80, height: 100, fit: [pageWidth - 80, 100] });
            }

            // Organization name
            doc.fillColor('#000000')
                .fontSize(20)
                .font('Helvetica-Bold')
                .text('SUNYATEE INTERNATIONAL FOUNDATION', 50, headerY + 100, {
                    width: pageWidth - 100,
                    align: 'center'
                });

            // Draw line under organization name
            doc.moveTo(50, headerY + 130)
                .lineTo(pageWidth - 50, headerY + 130)
                .lineWidth(1)
                .stroke();

            // Organization details
            doc.fontSize(8)
                .font('Helvetica')
                .fillColor('#333333')
                .text('CIN: U85300TG2019NPL136990 REGD. OFFICE.: SY. NO 1128. BESIDE AYYAPPA TEMPLE, SIDDIPET, TELANGANA-502103',
                    50, headerY + 135, {
                    width: pageWidth - 100,
                    align: 'center'
                });

            doc.fontSize(8)
                .text('info@sifworld.com   www.sifworld.com', 50, headerY + 148, {
                    width: pageWidth - 100,
                    align: 'center'
                });

            // --- RECEIPT VOUCHER SECTION ---
            const voucherY = headerY + 175;

            // Receipt Voucher box
            doc.rect((pageWidth - 200) / 2, voucherY, 200, 30)
                .lineWidth(2)
                .stroke();

            doc.fontSize(14)
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text('RECEIPT VOUCHER', 50, voucherY + 8, {
                    width: pageWidth - 100,
                    align: 'center'
                });

            // Sr. No. and Date on same line
            const fieldY = voucherY + 50;
            doc.fontSize(11)
                .font('Helvetica')
                .text(`Sr. no. : ${bookingData.serialNumber}`, 70, fieldY);

            doc.text(`Date : ${bookingData.date}`, pageWidth - 250, fieldY);

            // Horizontal line
            doc.moveTo(70, fieldY + 25)
                .lineTo(pageWidth - 70, fieldY + 25)
                .lineWidth(1)
                .stroke();

            // --- DETAILS SECTION ---
            const detailsY = fieldY + 45;

            // Received From and Age
            doc.fontSize(11)
                .text(`Received From : ${bookingData.name}`, 70, detailsY);

            doc.text(`Age : ${bookingData.age}`, pageWidth - 250, detailsY);

            // Towards and Room Type
            doc.text(`Towards : SUNYATEE RETREAT SHANTIVAN 26`, 70, detailsY + 35);
            doc.text(`Room Type : ${bookingData.roomType}`, pageWidth - 250, detailsY + 35);

            // Mobile No.
            doc.text(`Mobile No. ${bookingData.mobile}`, 70, detailsY + 70);

            // Transaction ID
            doc.text(`Txn. Id : ${bookingData.transactionId}`, 70, detailsY + 105);

            // Amount box (right side, prominent)
            const amountBoxY = detailsY + 85;
            doc.rect(pageWidth - 320, amountBoxY, 250, 40)
                .lineWidth(2)
                .stroke();

            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text(`AMOUNT : ₹ ${bookingData.amount.toLocaleString('en-IN')}`,
                    pageWidth - 310, amountBoxY + 12);

            // Horizontal line before signatures
            const signatureY = detailsY + 180;
            doc.moveTo(70, signatureY)
                .lineTo(pageWidth - 70, signatureY)
                .lineWidth(1)
                .stroke();

            // --- SIGNATURE SECTION ---
            const sigY = signatureY + 40; // Adjusted for signature images

            // 1. Accountant Signature (Center)
            const accountantSigPath = path.join(__dirname, '../../assets/sig-accountant.png');
            if (fs.existsSync(accountantSigPath)) {
                doc.image(accountantSigPath, (pageWidth - 100) / 2, sigY - 30, { width: 100, height: 60, fit: [100, 60] });
            }

            // 2. Authorized Signatory (Right)
            const authorizedSigPath = path.join(__dirname, '../../assets/sig-authorized.png');
            if (fs.existsSync(authorizedSigPath)) {
                // Determine placement based on user's png 1
                doc.image(authorizedSigPath, pageWidth - 200, sigY - 30, { width: 100, height: 60, fit: [100, 60] });
            }

            // Labels under lines
            const labelY = sigY + 40;

            doc.fontSize(9)
                .font('Helvetica')
                .text('RECEIVER SIGNATURE', 90, labelY, { width: 150, align: 'center' });

            doc.text('ACCOUNTANT', (pageWidth - 150) / 2, labelY, { width: 150, align: 'center' });

            doc.text('AUTHORIZED SIGNATORY', pageWidth - 240, labelY, { width: 150, align: 'center' });

            // Lines for signatures
            doc.moveTo(90, labelY - 5)
                .lineTo(240, labelY - 5)
                .lineWidth(1)
                .stroke();

            doc.moveTo((pageWidth - 150) / 2, labelY - 5)
                .lineTo((pageWidth - 150) / 2 + 150, labelY - 5)
                .stroke();

            doc.moveTo(pageWidth - 240, labelY - 5)
                .lineTo(pageWidth - 90, labelY - 5)
                .stroke();

            // Finalize PDF
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateReceipt };
