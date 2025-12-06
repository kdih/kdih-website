const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Generate a booking receipt PDF
 * @param {Object} data - Receipt data
 * @param {string} data.type - 'desk' or 'room'
 * @param {Object} data.customer - Customer details (name, email, phone)
 * @param {Object} data.booking - Booking details (desk/room, date, etc)
 * @param {Object} data.payment - Payment details (amount, reference, date)
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generateBookingReceipt(data) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const buffers = [];

            // Collect PDF data into buffers
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            // Generate receipt number
            const receiptNumber = `RCP-${new Date().getFullYear()}-${String(data.booking.id).padStart(6, '0')}`;
            const currentDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Header - KDIH Branding
            doc.fontSize(24)
                .fillColor('#1e3a8a')
                .text('KDIH', { align: 'left' });

            doc.fontSize(10)
                .fillColor('#6b7280')
                .text('Kano Digital Innovation Hub', { align: 'left' });

            doc.moveDown(0.5);
            doc.fontSize(18)
                .fillColor('#111827')
                .text('PAYMENT RECEIPT', { align: 'right' });

            // Horizontal line
            doc.moveTo(50, doc.y + 10)
                .lineTo(545, doc.y + 10)
                .strokeColor('#e5e7eb')
                .stroke();

            doc.moveDown(1.5);

            // Receipt Info
            doc.fontSize(10)
                .fillColor('#6b7280')
                .text('Receipt Number:', 50, doc.y)
                .fillColor('#111827')
                .text(receiptNumber, 200, doc.y);

            doc.moveDown(0.5);
            doc.fillColor('#6b7280')
                .text('Issue Date:', 50, doc.y)
                .fillColor('#111827')
                .text(currentDate, 200, doc.y);

            doc.moveDown(2);

            // Customer Info Section
            doc.fontSize(12)
                .fillColor('#1e3a8a')
                .text('BILLED TO', 50, doc.y);

            doc.moveDown(0.5);
            doc.fontSize(10)
                .fillColor('#111827')
                .text(data.customer.name, 50, doc.y);

            doc.fillColor('#6b7280')
                .text(data.customer.email, 50, doc.y);

            if (data.customer.phone) {
                doc.text(data.customer.phone, 50, doc.y);
            }

            doc.moveDown(2);

            // Booking Details Section
            doc.fontSize(12)
                .fillColor('#1e3a8a')
                .text('BOOKING DETAILS', 50, doc.y);

            doc.moveDown(0.5);

            // Table-like structure for booking details
            const details = [
                { label: 'Type', value: data.type === 'desk' ? 'Desk Booking' : 'Meeting Room Booking' },
                { label: data.type === 'desk' ? 'Desk Number' : 'Room Name', value: data.booking.desk_room },
                { label: 'Booking Date', value: data.booking.date },
            ];

            if (data.booking.booking_type) {
                details.push({ label: 'Booking Type', value: data.booking.booking_type });
            }

            if (data.booking.time) {
                details.push({ label: 'Time', value: data.booking.time });
            }

            details.forEach(item => {
                doc.fontSize(10)
                    .fillColor('#6b7280')
                    .text(item.label + ':', 50, doc.y, { width: 150, continued: false });

                doc.fillColor('#111827')
                    .text(item.value, 200, doc.y);

                doc.moveDown(0.5);
            });

            doc.moveDown(1);

            // Payment Summary Box
            const boxY = doc.y;
            doc.rect(50, boxY, 495, 80)
                .fillAndStroke('#f9fafb', '#e5e7eb');

            doc.fontSize(11)
                .fillColor('#111827')
                .text('Payment Reference:', 60, boxY + 15)
                .text(data.payment.reference, 200, boxY + 15);

            doc.text('Payment Date:', 60, boxY + 35)
                .text(data.payment.date, 200, boxY + 35);

            doc.fontSize(14)
                .fillColor('#1e3a8a')
                .text('Amount Paid:', 60, boxY + 55)
                .fontSize(16)
                .text('₦' + parseFloat(data.payment.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 }), 200, boxY + 55);

            doc.moveDown(6);

            // Status Badge
            doc.fontSize(10)
                .fillColor('#10b981')
                .text('✓ PAID', 50, doc.y);

            doc.moveDown(2);

            // Footer
            doc.fontSize(9)
                .fillColor('#6b7280')
                .text('Thank you for choosing Kano Digital Innovation Hub!', 50, doc.y, { align: 'center' });

            doc.moveDown(1);
            doc.fontSize(8)
                .fillColor('#9ca3af')
                .text('For inquiries, contact us at info@kdih.org', { align: 'center' });

            doc.text('© ' + new Date().getFullYear() + ' KDIH. All rights reserved.', { align: 'center' });

            // Finalize PDF
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generateBookingReceipt
};
