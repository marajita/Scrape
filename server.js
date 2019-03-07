var express = require("express");
var logger = require("morgan");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");


// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;
// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Middleware
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(express.json());
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);

app.set("view engine", "handlebars");

// Routes
require("./routes/htmlRoutes")(app);

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scraper", {
  useNewUrlParser: true
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  db.Article.findAll({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/", function (req, res) {
  res.send("Hello world");
});

app.get("/articles/:id", function (req, res) {

  db.Article.findOne({
      _id: mongojs.ObjectId(req.params.id)
        .populate("notes").then(function (dbUser) {
          res.json(dbUser)
            .catch(function (err) {
              res.json(err);
            });
        })
    },
    function (error, found) {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        console.log(found);
        res.send(found);
      }

    }
  )
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});