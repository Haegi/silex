const { MongoClient } = require('mongodb');

class DatabaseController {
  constructor(url, dbname) {
    this.url = url;
    this.dbname = dbname;
    this.CollName = 'customer';
    this.mongodburl = `mongodb://${url}/${dbname}`;
  }

  connect() {
    MongoClient.connect(this.mongodburl, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;
      console.log(`Connected to ${this.mongodburl}`);
      this.myCollection = db.collection('test');
      this.db = db;
    });
  }


  insert() {
    this.myCollection.insert({ name: 'doduck', description: 'learn more than everyone' }, (err, result) => {
      if (err) { throw err; }

      console.log('entry saved');
    });
  }
}


module.exports = DatabaseController;
