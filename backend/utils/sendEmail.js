import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // 1) Create a transporter using Ethereal for development
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'madisen.conn@ethereal.email', // generated ethereal user
            pass: 'Jq6xSjB6kCqfNnZJzG'  // generated ethereal password
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
