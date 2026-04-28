// lib/emailService.js
const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

function getTransporter() {
    if (!transporter && config.emailSender && config.emailAppPassword) {
        transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,                 // use TLS
            requireTLS: true,
            auth: {
                user: config.emailSender,
                pass: config.emailAppPassword,
            },
            connectionTimeout: 15000,      // 15 seconds – avoid hanging
            greetingTimeout: 10000,
            socketTimeout: 15000,
            debug: false,                  // set true temporarily to debug
            logger: false,
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
        from: `"Maureonix Reporter" <${config.emailSender}>`,
        to: to || config.emailRecipient,
        subject,
        text,
    };

    if (attachmentBuffer) {
        mailOptions.attachments = [{ filename: attachmentName, content: attachmentBuffer }];
    }

    // Try up to 2 times with a short delay
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            await transport.sendMail(mailOptions);
            console.log(`[EmailService] Report sent to ${mailOptions.to}`);
            return true;
        } catch (err) {
            console.error(`[EmailService] Attempt ${attempt} failed:`, err.message);
            if (attempt === 2) return false;
            // wait 5 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    return false;
}

module.exports = { sendEmail };