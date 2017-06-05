'use strict';

const express = require("express");
const requestPromise = require("request-promise");
const cowsay = require("cowsay");

// Constants
const PORT = 8080;

// App
const app = express();

app.get("/", async function(req, res) {
  try {
    const recipeResponse = await requestPromise(`http://www.recipepuppy.com/api/?i=-beef%2C+&q= &p=${Math.floor((Math.random() * 100) + 1)}`);
    const recipe = JSON.parse(recipeResponse).results[0];
    const responseText = `<pre>${cowsay.say({ text: recipe.title })}</pre>`;

    res.send(responseText);
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
