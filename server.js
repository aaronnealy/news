// Require dependencies 
var express = require("express");
var axios = require("axios");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var logger = require("morgan");
require('dotenv').config

//Require all models
var db = require("./models");


var PORT = process.env.PORT || 4000; 

var app = express();


app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder

if(process.env.NODE_ENV === "production"){
  app.use(express.static("client/build"));
}
app.use(express.static("public"));


// Connect to the Mongo DB
let = MONGODB_URI = process.env.MONGODB_URI||"mongodb://localhost/unit18Populater"
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//Routes

app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://news.ycombinator.com/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $(".title").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");
  
        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });
  
      // Send a message to the client
      res.send("Scrape Complete");
    });
  });
  
  // Route for getting all Articles from the db
  app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
        
      })
      
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      })
        
  });

  app.get("/articles/:id", function(req, res) {

    db.Article.findOne({ _id: req.params.id })
     
      .populate("note")
      .then(function(dbArticle) {
  
        res.json(dbArticle);
      })
      .catch(function(err) {

        res.json(err);
      });
  });

  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
