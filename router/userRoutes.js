const Express = require("express");
const userController = require("../controllers/user-controller");
const { Protected } = require("../middleWares/auth");
const { fileUpload } = require("../middleWares/file-upload");
const { signUpValidations, loginValidations, profileValidations, userProfileUpdateValidation } = require("../Validations/UserValidation");
const { grantAccess } = require("../middleWares/admin-access");
const { check } = require("express-validator");

const Router = Express.Router();

Router.route("/signUp").post(signUpValidations, userController.signUp);
Router.route("/login").post(loginValidations, userController.logIn);
Router.route("/forgetPassword").post([check("phoneNumber").notEmpty().withMessage("Please Provide PhoneNumber")], userController.forgotPassword);
Router.route("/verifyOtp/").post([check("otp").isLength({ min: 4, max: 4 }).withMessage("Otp must be  4 characters long")], userController.verifyOtp)
Router.route("/resetPassword/:userId").post(
    [check("newPassword").isLength({ min: 8 }).withMessage("Password must be  atleast 8 characters long"),
    check("confirmPassword").isLength({ min: 8 }).withMessage("Newpassword must be  atleast 8 characters long")], userController.resetPassword);
Router.route("/verifyAccount").post([check("otp").isLength({ min: 4, max: 4 }).withMessage("Otp must be  4 characters long")], userController.verfiyAccount);
// Protected Routes
Router.use(Protected);
Router.route("/all").get(grantAccess("admin"), userController.getAllUsers);
Router.route("/myProfile")
    .post(fileUpload.single("image"), profileValidations, userController.updateProfile)
    .get(userController.myProfile);

Router.route("/updatePassword").post(userController.updatePassword);
Router.route("/updateUserProfile").post(fileUpload.single("image"), userProfileUpdateValidation, userController.updateUserProfile);
Router.route("/sendOtpForPhoneNumber").post(
    [check("phoneNumber").notEmpty().withMessage("Please provide phoneNumber")],
    userController.sendOtpForPhoneNumber);
Router.route("/updatePhoneNumber").post([check("otp").isLength({ min: 4, max: 4 }).withMessage("Otp must be  4 characters long")], userController.updatePhoneNumber);
Router.route("/resendOtp").post(userController.resendOtp);


// Router.route("/:userId").delete(userController.deleteUser);



module.exports = Router;

// https://www.regextester.com/97440  For regex of Phone Number...