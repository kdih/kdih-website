const nodemailer = require('nodemailer');
console.log('Nodemailer type:', typeof nodemailer);
console.log('Keys:', Object.keys(nodemailer));
try {
    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: { user: 'test', pass: 'test' }
    });
    console.log('Transporter created successfully');
} catch (e) {
    console.error('Error:', e.message);
}
