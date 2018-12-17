const DatabaseController = require('./dbcontroller.js');

class DBWrapper {
  // Singleton
  static getInstance(url, db) {
    if (!this.instance) {
      this.instance = new DatabaseController(url, db);
      return this.instance;
    }
    return this.instance;
  }
}
module.exports = DBWrapper;
