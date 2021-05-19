const twilio = require("twilio");
require("dotenv").config({
    path: "./config.env"
});
exports.sendOtp = async (otp, phoneNumber) => {
    try {
        let accountSid = process.env.TWILIO_ACCOUNT_SID;
        let authToken = process.env.TWILIO_AUTH_TOKEN;
        let client = new twilio(accountSid, authToken);
        let sendMsg = await client.messages.create({
            body: `Your otp is ${otp}`,
            to: phoneNumber,
            from: process.env.TWILIO_PHONENUMBER
        });
        console.log(sendMsg);
    } catch (error) {
        console.log(error);
    }
}
