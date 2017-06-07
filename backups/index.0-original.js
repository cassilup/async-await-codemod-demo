'use strict';

const express = require("express");
const requestPromise = require("request-promise");
const cowsay = require("cowsay");
const generateBeefFreeRecipeURL = require("./recipes.js");

// Constants
const PORT = 8080;

// App
const app = express();

app.get("/", function(req, res) {
  requestPromise(generateBeefFreeRecipeURL()).then(function(recipeResponse) {
    const recipesList = JSON.parse(recipeResponse).results;
    const recipe = recipesList[0];
    const responseText = `<pre>${
      cowsay.say({
        text: recipe.title
      })
    }</pre>`;

    res.send(responseText);
  }, function(error) {
    console.log(error);
  });
});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
