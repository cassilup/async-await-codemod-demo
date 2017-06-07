"use strict";

const generateRandomNumber = (min, max) => Math.floor((Math.random() * max) + min);

/*
 * Generates a
 */
const generateBeefFreeRecipeURL = () => {
  const ingredients = "-beef,+"; // NO BEEF, anything else is ok
  const searchString = " ";
  const page = generateRandomNumber(1, 100);

  return `http://www.recipepuppy.com/api/?i=${ingredients}&q=${searchString}&p=${page}`;
};

module.exports = generateBeefFreeRecipeURL;
