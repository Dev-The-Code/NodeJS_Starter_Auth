const { app } = require("./config/connection");
const UserRoute = require("./router/v1/userRoutes");
const { deleteImage } = require("./utils");
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 200,
};

// configure
app.use(express.json({ limit: "200mb" }));
app.use(express.json({}));
app.use(cors(corsOptions));
//app use
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
// Body Parsing
app.use(express.json({}));
app.use(bodyParser.json()); // handle json data
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get('/', (req, res) => res.status(204).end())
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Mounting Up The Routes
app.use("/api", require("./router/index"));

// No Path Found Middleware
app.use(("*", (req, _, next) => {
    return next({
        error: `Unable To Find Path ${req.protocol}://${req.url}`,
        statusCode: 404
    })
}));

// Error Middelware
app.use((err, req, res, _) => {
    if (err.code === "LIMIT_FILE_SIZE" && err.field === "video") {
        res.status(err.statusCode || 500).json({
            error: "File Is Too Large Max Limit 8MB"
        })
    } else {
        // If We Add Image And Suddenly Error Occur
        // Than We Have To Delete That Image Which Was The Part Of Rejected Req-
        deleteImage(req);
        res.status(err.statusCode || 500).json({
            error: err.message || err.error || err
        })
    }

})

// Listening To The PORT
const port = process.env.PORT || 5000;

app.listen(port, (err) => {
    if (err) return console.log("Unable To Start Server :(");
    console.log(`Server Is Running On Port ${port}`);
})
