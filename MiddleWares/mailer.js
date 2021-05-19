const nodemailer = require("nodemailer");
require("dotenv").config({
    path: "./config.env"
})

const username = process.env.email;
const password = process.env.password;
const host = process.env.host;
const smtp_port = process.env.EMAIL_PORT;

let data = {
    name: "Moin Akhter",
    email: "moinakhter179@gmail.com",
    verificationCode: "1234563453"
}


// assemblie@webappmart.co.uk

// async..await is not allowed in global scope, must use a wrapper
// module.exports = 
async function main(data) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        pool: true,
        name: username,
        host: host,
        port: smtp_port,
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        secure: false, // true for 465, false for other ports
        auth: {
            user: username, // generated ethereal user
            pass: password, // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    let html_data = `
    <p>Dear ${data.name},</p>
    <h2>Your Verification Code To Reset Password</h2>
    <h4>${data.verificationCode}</h4>
    <h3>This code is Valid For 15 minutes only<h3>
    `;

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"ZUM_no_reply" <' + username + '>', // sender address
        to: data.email, // list of receivers
        subject: "Verification Code", // Subject line
        text: "Here is your email & password for Pharmaceutical dashboard", // plain text body
        html: html_data // html body
    });
    // console.log('email data', info)
    console.log("Message sent: %s", info);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

main(data);
