import nodemailer from 'nodemailer';

// Create a transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendMail = async (receiver) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: receiver,
        subject: 'Welcome email',
        text: 'This is a test email sent from Node.js using Nodemailer!'
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error:', error.message);
        throw error; // Re-throw the error to be handled by the caller
    }
};

export default sendMail;
