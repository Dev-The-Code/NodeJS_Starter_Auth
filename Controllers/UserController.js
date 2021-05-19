const UserModel = require("../Models/UserModel");
const { checkValidation, deleteImage } = require("../utils");
const Bcryptjs = require("bcryptjs");
const uuid = require("uuid");
const { sendOtp } = require("../sendOtp");
const _ = require("underscore");
// const { db } = require("../Connection");
// const AdsModel = require("../Models/AdsModel");


// @Route http://localhost:4000/api/v1/user/signUp/
// @Method POST
// @Desc Add new user-
exports.signUp = async (req, res, next) => {
    try {
        // Checking Validation-
        let errors = checkValidation(req);
        if (errors) {
            return next(errors);
        }
        // Checking whether any other user exists with the same email-
        let existingUser = await UserModel.findOne({ email: req.body.email, verified: true });
        if (existingUser) {
            return next({
                error: "Email In Use-Please Select Any Other Unique Email",
                statusCode: 403
            })
        } else {
            let existingUser = await UserModel.findOne({ phoneNumber: req.body.phoneNumber, verified: true });
            if (existingUser) {
                return next({
                    error: "Phone Number In Use-Please Select Any Other Unique Phone Number",
                    statusCode: 403
                })
            }
            let notVefiedUserExists = await UserModel.findOne({ $or: [{ email: req.body.email }, { phoneNumber: req.body.phoneNumber }], verified: false });
            const otp = uuid.v1().split("-")[0].substring(4);
            // const otpDuration=Date.now()+60*60000;
            if (notVefiedUserExists) {
                let obj = {
                    otp,
                    // otpDuration,
                    ...req.body
                }
                _.extend(notVefiedUserExists, obj);
                await notVefiedUserExists.save();
                role = notVefiedUserExists.role;
                id = notVefiedUserExists._id;
                user = notVefiedUserExists;
            } else {
                let newUser = new UserModel({
                    ...req.body,
                    otp,
                    // otpDuration,
                    image: {
                        mimetype: "image/jpg",
                        filename: "Anonymous",
                        path: "Uploads/Anonymous.jpg"
                    }
                });
                await newUser.save();
                id = newUser._id;
                role = newUser.role;
                user = newUser;
            }
            await sendOtp(otp, req.body.phoneNumber);
            res.status(201).json(otp);
        }
    } catch (error) {
        console.log(error)
        next({
            error,
            statusCode: 500
        });
    }
};

// @Route http://localhost:4000/api/v1/user/login/
// @Method POST
// @Desc Login User
exports.logIn = async (req, res, next) => {
    try {
        let errors = checkValidation(req);
        if (errors) {
            return next(errors);
        }
        const isUserExists = await UserModel.findOne({ email: req.body.email, verified: true });
        if (!isUserExists) {
            return next({
                error: "Invalid email or password",
                statusCode: 400
            })
        }
        const isCorrectPassword = await isUserExists.verifyPassword(req.body.password, isUserExists.password);
        if (!isCorrectPassword) {
            return next({
                error: "Invalid email or password",
                statusCode: 400
            })
        }

        const token = UserModel.GenerateToken(isUserExists._id, isUserExists.role)

        res.status(200).json({
            token,
            user: isUserExists
        })
    } catch (error) {
        console.log(error);
        next({
            error,
            statusCode: 500
        });
    }
}


// @Route http://localhost:4000/api/v1/user/myProfile/
// @Method POST
// @Desc Update Currently LoggedIn User
exports.updateProfile = async (req, res, next) => {
    try {
        let errors = checkValidation(req) || { error: {} };


        if (req.body.newPassword.trim().length > 0 || req.body.confirmPassword.trim().length > 0) {
            if (req.body.currentPassword.trim().length === 0)
                errors.error.currentPassword = 'Please provide current password';
        }
        if (req.body.currentPassword.trim().length > 0 || req.body.confirmPassword.trim().length > 0) {
            if (req.body.newPassword.trim().length === 0) {
                errors.error.newPassword = 'Please provide new password';
            } else if (req.body.newPassword.trim() !== req.body.confirmPassword.trim()) {
                errors.error.newPassword = 'Confirm and new password should match';
            } else if (req.body.newPassword.trim().length < 8) {
                errors.error.newPassword = 'Should be atleast 8 characters long';
            }
        }
        if (req.body.currentPassword.trim().length > 0 || req.body.newPassword.trim().length > 0) {
            if (req.body.newPassword.trim().length === 0) {
                errors.error.confirmPassword = 'Please provide confirm password';
            }
            else if (req.body.newPassword.trim() !== req.body.confirmPassword.trim()) {
                errors.error.confirmPassword = 'Confirm and new password should match';
            } else if (req.body.confirmPassword.trim().length < 8) {
                errors.error.confirmPassword = 'Should be atleast 8 characters long';
            }
        }

        if (Object.keys(errors.error).length > 0) {
            return next(errors);
        }
        let isUserExists;
        if (req.user.email !== req.body.email) {
            isUserExists = await UserModel.findOne({ email: req.body.email })
        }
        if (isUserExists) {
            return next({
                error: "Email already in use.Please try any other unique email",
                statusCode: 403
            })
        }

        if (req.body.currentPassword.trim().length > 2) {
            let errors = { error: {} };
            let isUserExists = await UserModel.findById(req.user._id);
            if (!isUserExists) {
                return res.status(404).json({
                    error: "Couldn't find this user"
                })
            }
            const isCorrectPassword = await isUserExists.verifyPassword(req.body.currentPassword, isUserExists.password);
            if (!isCorrectPassword) {
                errors.error.currentPassword = "Incorrect Current Password";
                return next(errors);
            } else {

                const salt = await Bcryptjs.genSalt(10);
                let password = await Bcryptjs.hash(req.body.newPassword, salt);

                let updatedProfile = await UserModel.findByIdAndUpdate(req.user._id, {
                    ...req.body,
                    password: password,
                    image: req.file ? {
                        mimetype: req.file.mimetype,
                        filename: req.file.filename,
                        path: req.file.path
                    } : req.user.image
                }, { new: true });
                // If we updated our image then delete previous image-
                if (req.file) {
                    if (req.user.image.filename !== "Anonymous") {
                        deleteImage(null, req.user.image.path);
                    }
                }
                res.status(200).json(updatedProfile);
            }
        } else {
            let updatedProfile = await UserModel.findByIdAndUpdate(req.user._id, {
                ...req.body,
                image: req.file ? {
                    mimetype: req.file.mimetype,
                    filename: req.file.filename,
                    path: req.file.path
                } : req.user.image
            }, { new: true });
            // If we updated our image then delete previous image-
            if (req.file) {
                if (req.user.image.filename !== "Anonymous") {
                    deleteImage(null, req.user.image.path);
                }
            }
            res.status(200).json(updatedProfile);
        }

    } catch (error) {
        console.log(error.message);
        next({
            error,
            statusCode: 500
        });
    }
}


exports.updatePhoneNumber = async (req, res, next) => {
    let errors = checkValidation(req);
    if (errors) {
        return next(errors);
    }
    else {
        let user = await UserModel.findOne({ _id: req.user._id, otp: req.body.otp });
        if (!user) {
            return next({
                error: "Invalid Otp",
                statusCode: 400
            })
        }
        // else if(Date.now()>user.otpDuration){
        //     return res.status(400).json({
        //         error:"OTP expired"
        //     })
        // }

        user.otp = "";
        user.otpDuration = "";
        user.phoneNumber = user.newPhoneNumber;
        user.newPhoneNumber = "";
        await user.save();
        res.status(201).json({
            user
        });
    }
}


// @Route http://localhost:4000/api/v1/user/myProfile/
// @Method GET
// @Desc Get Currently LoggedIn User Profile Info
exports.myProfile = async (req, res, next) => {
    try {
        let user = await UserModel.findById(req.user._id).populate("fav")
        res.status(200).json({
            user
        })
    } catch (error) {
        console.log(error);
        next({
            error,
            statusCode: 500
        });
    }
}

// @Route http://localhost:4000/api/v1/user/all
// @Method GET
// @Desc Get All Users Info
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await UserModel.find({ role: { $ne: "admin" } }).sort({ "createdAt": -1 });
        res.status(200).json({
            count: users.length,
            users
        })
    } catch (error) {
        console.log(error);
        next({
            error,
            statusCode: 500
        });
    }
}

// // @Route http://localhost:4000/api/v1/user/:userId
// // @Method DELETE
// // @Desc Delete user with userId
// exports.deleteUser = async (req, res, next) => {
//     let session = await db.startSession();
//     try {
//         session.startTransaction();
//         const deletedUser = await UserModel.findByIdAndDelete(req.params.userId, { session: session });
//         if (!deletedUser) {
//             return next({
//                 error: "No user found",
//                 statusCode: 404
//             })
//         }
//         // await AdsModel.deleteMany({ createdBy: req.params.userId }, { session: session });
//         await session.commitTransaction();
//         session.endSession();
//         res.status(200).json({ success: true })
//     } catch (error) {
//         console.log(error);
//         await session.abortTransaction();
//         next({
//             error,
//             statusCode: 500
//         });
//     }
// }


// @Route http://localhost:4000/api/v1/user/forgetPassword
// @Method POST
// @Desc SEND OTP TO USER-
exports.forgotPassword = async (req, res, next) => {
    try {
        console.log(req.body)
        let errors = checkValidation(req);
        if (errors) {
            return next(errors);
        }
        const user = await UserModel.findOne({ phoneNumber: req.body.phoneNumber, verified: true });
        console.log(user);
        if (!user) {
            res.status(404).json({
                error: "Couldn't find user"
            })
        } else {
            const otp = uuid.v1().split("-")[0].substring(4);
            user.otp = otp;
            user.otpDuration = Date.now() + 60 * 60000;
            // 
            await sendOtp(otp, req.body.phoneNumber);
            await user.save();
            return res.status(200).json({
                OTP: otp.split("-")[0]
            });
        }


    } catch (error) {
        console.log(error);
        next({
            error,
            statusCode: 500
        });
    }
}

// @Route http://localhost:4000/api/v1/user/updatePassword
// @Method POST
// @Desc Update User's Password Not Admin-
exports.updatePassword = async (req, res, next) => {
    try {
        let errors = {
            error: {}
        };

        if (req.body.currentPassword.trim().length <= 2) {
            errors.error.currentPassword = "Please provide current password";
        } else if (req.body.currentPassword.trim().length > 2) {
            const isCorrectPassword = await req.user.verifyPassword(req.body.currentPassword, req.user.password);
            if (!isCorrectPassword) {
                errors.error.currentPassword = "Please provide correct current password";
            }
        }

        if (req.body.newPassword.trim().length <= 2) {
            errors.error.newPassword = "Please provide new password";
        } else if (req.body.newPassword.trim().length > 2) {
            if (req.body.newPassword.trim() !== req.body.confirmPassword.trim()) {
                errors.error.newPassword = "New password and confirm password should be same";
            }
        }


        if (req.body.confirmPassword.trim().length <= 2) {
            errors.error.confirmPassword = "Please provide confirm password";
        } else if (req.body.confirmPassword.trim().length > 2) {
            if (req.body.newPassword.trim() !== req.body.confirmPassword.trim()) {
                errors.error.confirmPassword = "New password and confirm password should be same";
            }
        }


        if (Object.keys(errors.error).length > 0) {
            return next(errors);
        }

        req.user.password = req.body.newPassword;

        const updatedUser = await req.user.save();
        res.status(200).json({
            user: updatedUser
        })
    } catch (error) {
        console.log(error);
        next({
            error,
            statusCode: 500
        });
    }
}


// @Route http://localhost:4000/api/v1/user/updateUserProfile
// @Method POST
// @Desc Update User's Profile Not Admin-
exports.updateUserProfile = async (req, res, next) => {
    try {
        let isUserExists;
        let errors = checkValidation(req);
        if (errors) {
            return next(errors);
        }
        if (req.user.email !== req.body.email) {
            isUserExists = await UserModel.findOne({ email: req.body.email })
        }
        if (isUserExists) {
            return next({
                error: "Email already in use.Please try any other unique email",
                statusCode: 403
            })
        }
        let updatedProfile = await UserModel.findByIdAndUpdate(req.user._id, {
            ...req.body,
            image: req.file ? {
                mimetype: req.file.mimetype,
                filename: req.file.filename,
                path: req.file.path
            } : req.user.image
        }, { new: true });
        // If we updated our image then delete previous image-
        if (req.file) {
            if (req.user.image.filename !== "Anonymous") {
                deleteImage(null, req.user.image.path);
            }
        }
        res.status(200).json(updatedProfile);
    } catch (error) {
        console.log(error);
        next({
            error,
            statusCode: 500
        });
    }
}



exports.sendOtpForPhoneNumber = async (req, res, next) => {
    let errors = checkValidation(req);
    if (errors) {
        return next(errors);
    }
    try {

        let isUserExists = await UserModel.findOne({ email: { $ne: req.user.email }, phoneNumber: req.body.phoneNumber, verified: true });
        if (isUserExists) {
            return next({
                error: "Phone Number is already in use.",
                statusCode: 403
            })
        } else {
            const otp = uuid.v1().split("-")[0].substring(4);
            req.user.otp = otp;
            req.user.otpDuration = Date.now() + 60 * 60000;
            req.user.newPhoneNumber = req.body.phoneNumber;
            await sendOtp(otp, req.body.phoneNumber);
            await req.user.save();
            return res.status(200).json({
                OTP: otp.split("-")[0]
            });
        }
    } catch (error) {
        console.log(error);
        next({
            error,
            statusCode: 500
        });
    }
}

// @Route http://localhost:4000/api/v1/user/resetPassword/:userId
// @Method POST
// @Desc SEND OTP TO USER-
exports.resetPassword = async (req, res, next) => {
    let errors = checkValidation(req) || { error: {} };

    if (req.body.newPassword.length > 2 && req.body.confirmPassword.length > 2 && req.body.newPassword !== req.body.confirmPassword) {
        errors.error = "ConfirmPassword and NewPassword must be same"
    }
    if (Object.keys(errors.error).length > 0) {
        return next(errors);
    }
    else {
        let user = await UserModel.findById(req.params.userId);
        if (!user) {
            return next({
                error: "Couldn't find user",
                statusCode: 400
            })
        }
        user.password = req.body.newPassword;
        await user.save();
        res.status(201).json({
            success: true
        });
    }
}



exports.resendOtp = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user._id);
        if (!user) {
            return next({
                error: "Couldn't find any user",
                statusCode: 404
            })
        }
        const otp = uuid.v1().split("-")[0].substring(4);
        user.otp = otp;
        user.otpDuration = Date.now() + 60 * 60000;
        // Here in sendOtp in 2nd parameter we will send newPhoneNumber like this
        // await sendOtp(otp,user.newPhoneNumber);
        await sendOtp(otp, user.phoneNumber);
        await user.save();
        return res.status(200).json({
            OTP: otp.split("-")[0]
        });
    } catch (error) {
        console.log(error);
        next({
            error,
            statusCode: 500
        });
    }
}


exports.verifyOtp = async (req, res, next) => {
    try {
        let errors = checkValidation(req);
        if (errors) {
            return next(errors);
        }
        const user = await UserModel.findOne({ otp: req.body.otp });
        if (!user) {
            return next({
                error: "Invalid Otp",
                statusCode: 400
            })
        }
        user.otp = null;
        user.otpDuration = null;
        await user.save();
        res.status(200).json(user._id);
    } catch (error) {
        console.log(error);
        next({
            error,
            statusCode: 500
        });
    }
}

exports.verfiyAccount = async (req, res, next) => {
    try {
        let errors = checkValidation(req);
        if (errors) {
            return next(errors);
        }
        const user = await UserModel.findOne({ otp: req.body.otp });
        if (!user) {
            return next({
                error: "Invalid Otp",
                statusCode: 400
            })
        }
        const isUserExists = await UserModel.findOne({ phoneNumber: user.phoneNumber, verified: true });
        if (isUserExists) {
            return next({
                error: "Phone Number is already in use.",
                statusCode: 403
            })
        }
        user.otp = null;
        user.otpDuration = null;
        user.verified = true;
        await user.save();
        const token = UserModel.GenerateToken(user._id, user.role, false);
        res.status(200).json({
            token,
            user
        })
    } catch (error) {
        console.log(error);
        next({
            error,
            statusCode: 500
        });
    }
}