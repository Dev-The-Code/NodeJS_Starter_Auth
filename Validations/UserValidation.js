

const { check } = require("express-validator");
const moment = require("moment");

exports.signUpValidations = [
    check("fullName").notEmpty().withMessage("Please provide FullName"),
    check("password").isLength({ min: 8 }).withMessage("Password must be atleast 8 characters long"),
    check("email").isEmail().withMessage("Please provide valid Email"),
    check("phoneNumber").custom(((value) => {
        if (!value) {
            throw new Error("Please provide your Phone Number");
        } else {
            let isValid = /(([+][(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))\s*[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?([-\s\.]?[0-9]{3})([-\s\.]?[0-9]{3,4})/.test(value)
            if (!isValid) {
                throw new Error("Please provide a valid Phone Number");
            }
        }

        return true;
    })),
    check("dob").notEmpty().withMessage("Please provide your Date Of Birth").custom(((value) => {
        let currentDate = moment(new Date, "mm/dd/yyyy");
        let dob = moment(value, "mm/dd/yyyy");
        const milliseconds = currentDate.diff(dob, "milliseconds");
        const age = moment.duration(milliseconds, "milliseconds");
        if (age.years() < 10) {
            throw new Error("Your age need to be atleast 10 years")
        }
        return true;
    }))
];

exports.loginValidations = [
    check("password").isLength({ min: 5 }).withMessage("Password must be atleast 5 characters long"),
    check("email").isEmail().withMessage("Please provide valid Email")
];

exports.profileValidations = [
    check("fullName").notEmpty().withMessage("Please provide FullName"),
    check("email").isEmail().withMessage("Please provide valid Email"),
    check("currentPassword").custom((value, { req }) => {
        if (req.body.newPassword.trim().length > 0 || req.body.confirmPassword.trim().length > 0) {
            if (value.trim().length === 0) {
                throw new Error('Please provide current password');
            } else {
                return true;
            }
        }
        return true;
    }),
    check("newPassword").custom((value, { req }) => {
        if (req.body.newPassword.trim().length > 0 || req.body.confirmPassword.trim().length > 0) {
            if (value.trim().length === 0) {
                throw new Error('Please provide new password');
            } else {
                return true;
            }
        }
        return true;
    }),
    check("confirmPassword").custom((value, { req }) => {
        if (req.body.newPassword.trim().length > 0 || req.body.newPassword.trim().length > 0) {
            if (req.body.newPassword.trim() !== value.trim()) {
                throw new Error('Confirm password should match newPassword');
            } else {

            }
        }
        return true;
    })
];

exports.userProfileUpdateValidation = [
    check("fullName").notEmpty().withMessage("Please provide FullName"),
    check("email").isEmail().withMessage("Please provide valid Email"),
    check("dob").notEmpty().withMessage("Please provide your Date Of Birth").custom(((value) => {
        let currentDate = moment(new Date, "mm/dd/yyyy");
        let dob = moment(value, "mm/dd/yyyy");
        const milliseconds = currentDate.diff(dob, "milliseconds");
        const age = moment.duration(milliseconds, "milliseconds");
        if (age.years() < 10) {
            throw new Error("Your age need to be atleast 10 years")
        }
        return true;
    }))
]