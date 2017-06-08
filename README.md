# Cowsay running on Express -- Async/Await Transform Demo

This is support code for my http://jsheroes.io Conference [slides](http://tiny.cc/jsheroes-talk).
![First Slide](http://i.imgur.com/gGYRnV2.png)

Run:
```
npm install -g jscodeshift
```

And then automatically convert index.js to use async/await by running:
```
jscodeshift -t codemods/async-await-transform.js index.js
```
