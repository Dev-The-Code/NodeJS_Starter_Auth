
const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const _ = require("underscore");
require("dotenv").config({
  path: "./config.env"
});

const app = require("express")();
// app.use(Morgan("dev"));

// Static Folder For Images
app.use("/Uploads", express.static(path.join(__dirname, "Uploads")));

mongoose.connect(process.env.URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
}).then(async _ => {
  console.log("Connected To Mongodb Successfully :)");
}).catch(err => {
  console.log(err)
});


module.exports = {
  app, db: mongoose
}