const Mongoose = require("mongoose");
const Bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = Mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  phoneNumber: String,
  newPhoneNumber: {
    type: String,
    default: null
  },
  dob: Date,
  image: Object,
  resetPasswordToken: String,
  resetPasswordTokenDuration: Date,
  role: {
    type: String,
    default: "user"
  },
  ads: [{
    type: Mongoose.Schema.ObjectId,
    ref: "Advertises"
  }],
  fav: [{
    type: Mongoose.Schema.ObjectId,
    ref: "Favourites"
  }],
  otp: {
    type: String,
    default: null
  },
  otpDuration: {
    type: Date
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});


UserSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const salt = await Bcryptjs.genSalt(10);
    this.password = await Bcryptjs.hash(this.password, salt);
    return next();
  }
  next();
});


UserSchema.methods.verifyPassword = async (raw, hashed) => await Bcryptjs.compare(raw, hashed);


UserSchema.statics.GenerateToken = (id, role) => (jwt.sign({ id, role }, process.env.SECRET_KEY));




module.exports = Mongoose.model("Users", UserSchema);