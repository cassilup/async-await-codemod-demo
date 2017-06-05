# Cowsay running on Express -- Async/Await Transform Demo

Run:
```
npm install -g jscodeshift
```

And then automatically convert index.js to use async/await by running:
```
jscodeshift -t codemods/async-await-transform.js index.js
```
