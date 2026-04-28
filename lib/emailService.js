// lib/emailService.js
const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

function getTransporter() {
    if (!transporter && config.emailSender && config.emailAppPassword) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: config.emailSender, pass: config.emailAppPassword },
        });
    }
    return transporter;
}

async function sendEmail(to, subject, text, attachmentBuffer = null, attachmentName = 'report.txt') {
    const transport = getTransporter();
    if (!transport) {
        console.error('[EmailService] No email config – skipping send');
        return false;
    }
    const mailOptions = {
        from: config.emailSender,
        to: to || config.emailRecipient,
        subject,
        text,
    };
    if (attachmentBuffer) {
        mailOptions.attachments = [{ filename: attachmentName, content: attachmentBuffer }];
    }
    try {
        await transport.sendMail(mailOptions);
        return true;
    } catch (err) {
        console.error('[EmailService]', err);
        return false;
    }
}

module.exports = { sendEmail };