var express = require("express");
var logger = require("morgan");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");



module.exports = function (app) {
  // Load index page
  app.get("/", function (req, res) {
    console.log("pulling data from db");
    db.Article.find({}).then(function (dbArticle) {
      if (dbArticle.length !== 0) {
        res.render("index", {
          message: "",
          articles: dbArticle
        });
      } else {
        res.render("index", {
          message: "Opps, please scrape first",
          articles: dbArticle
        });
      }
    });
  });

  app.get("/saved", function (req, res) {
    db.Article.find({
      saved: true
    }).then(function (dbArticle) {
      res.render("save", {
        articles: dbArticle
      });
    });
  });

  app.get("/articles/:id", function (req, res) {
    db.Article.findOne({
        _id: req.params.id
      })
      // Specify that we want to populate the retrieved users with any associated notes
      .populate("notes")
      .then(function (dbArticle) {
        // If able to successfully find and associate all Users and Notes, send them back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurs, send it back to the client
        res.json(err);
      });
  });


  // Delete One from the DB
  app.get("/deleteNote/:id", function (req, res) {
    // Remove a note using the objectID
    db.Note.remove({
        _id: req.params.id
      },
      function (error, removed) {
        // Log any errors from mongojs
        if (error) {
          console.log(error);
          res.send(error);
        } else {
          // Otherwise, send the mongojs response to the browser
          // This will fire off the success function of the ajax request
          console.log(removed);
          res.send(removed);
        }
      }
    );
  });

  // A GET route for scraping the echoJS website
  app.get("/scrape", function (req, res) {
    console.log("Scrapping..")
    // First, we grab the body of the html with axios
    var URL = "https://www.cnbc.com/technology/";
    axios.get(URL).then(function (response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

      // Now, we grab every div.headline within an article tag, and do the following:
      $('div.headline').each(function (i, element) {

        // Save an empty result object
        var result = {};

        // Add the title, link, summary and date published and save them as properties of the result object
        result.title = $(this).children("a").text().trim();
        result.link = "https://www.cnbc.com" + $(this).children("a").attr("href").trim();
        result.description = $(this).parent().children("p").text().trim();
        result.datePublished = $(this).parent().children("time").text().trim();

        db.Article.updateOne({
            title: result.title,
            link: result.link
          }, result, {
            upsert: true
          })
          .then(function (dbArticle) {
            console.log(dbArticle);
          })
          .catch(function (err) {
            console.log(err);
          });

      });

      res.send(true);
    });
  });


  // Route for saving/updating an Article's associated Note
  app.post("/saveArticle/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        saved: true
      })
      .then(function (dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });


  // Route for saving/updating an Article's associated Note
  app.post("/deleteArticle/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        saved: false
      })
      .then(function (dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function (dbNote) {

        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({}, {
          $push: {
            notes: dbNote._id
          }
        }, {
          new: true
        });
      })
      .then(function (dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });


};