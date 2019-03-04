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

var db = require("../models");



module.exports = function (app) {
  // Load index page
  app.get("/", function (req, res) {
    console.log("pulling data from db");
    db.Article.find({}).then(function (dbArticle) {
      res.render("index", {
        articles: dbArticle
      });
    });
  });

  //TODO only pull the saved ones
  app.get("/saved", function (req, res) {
    db.Article.find({}).then(function (dbArticle) {
      res.render("save", {
        articles: dbArticle
      });
    });
  });



  // Render 404 page for any unmatched routes
  // app.get("*", function (req, res) {
  //   res.render("404");
  // });


  // A GET route for scraping the echoJS website
  app.get("/scrape", function (req, res) {
    console.log("Scrapping..")
    // First, we grab the body of the html with axios
    //http://time.com/section/us/
    axios.get("https://www.cnbc.com/health-and-science/").then(function (response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $('div.headline').each(function (i, element) {

        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this).children("a").text().trim();
        result.link = "https://www.cnbc.com" + $(this).children("a").attr("href").trim();
        result.description = $(this).parent().children("p").text().trim();
        result.datePublished = $(this).parent().children("time").text().trim();

        //console.log(JSON.stringify(result));

        //Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function (dbArticle) {
            //View the added result in the console
            console.log(dbArticle);
          })
          .catch(function (err) {
            //If an error occurred, log it
            console.log(err);
          });
      });

      // Send a message to the client
      res.send(true);
    });
  });


};