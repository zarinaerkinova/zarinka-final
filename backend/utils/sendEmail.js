import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // 1) Create a transporter using SendPulse SMTP
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // Use 'true' for port 465, 'false' for other ports like 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: '"Zarinka Cakes" <noreply@zarinka.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html
    };

    // 3) Actually send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

export default sendEmail;
