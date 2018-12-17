const express = require('express');
const DBWrapper = require('./dbwrapper.js');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

// verwenden einer andern Klasse

const db = DBWrapper.getInstance('mongo-0.mongo:27017', 'test');
db.connect();
db.insert();
// db.createColl('customer');
// db.insert();


// Expressserver
app.get('/', (req, res) => {
  res.send('Hello world\n');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
