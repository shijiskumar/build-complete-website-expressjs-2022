module.exports = class BaseModel {
  constructor(db) {
    this.setDB(db);
  }
  setDB(db) {
    this.db = db;
  }
  collection() {
    /* console.log('this._collection - ', this._collection);
    console.log('this.db - ', this.db); */
    if (this.collection) return this.collection;
    return (this.collection = this.db.collection("content"));
  }
};
