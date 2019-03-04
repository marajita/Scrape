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
/* require("./routes/auth")(app, passport);
require("./config/passport/passport.js")(passport, db.user);
require("./routes/apiRoutes")(app); */
require("./routes/htmlRoutes")(app);

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scraper", {
  useNewUrlParser: true
});

// Routes



// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.findAll({})
    .then(function (dbArticle) {
      // If all Users are successfully found, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
// Routes
// 1. At the root path, send a simple hello world message to the browser
app.get("/", function (req, res) {
  res.send("Hello world");
});

app.get("/articles/:id", function (req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Article.findOne({
      // Using the id in the url
      _id: mongojs.ObjectId(req.params.id)
        .populate("notes").then(function (dbUser) {
          res.json(dbUser)
            .catch(function (err) {
              // If an error occurs, send it back to the client
              res.json(err);
            });
        })
    },
    function (error, found) {
      // log any errors
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        // Otherwise, send the note to the browser
        // This will fire off the success function of the ajax request
        console.log(found);
        res.send(found);
      }

    }
  )
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note

});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});