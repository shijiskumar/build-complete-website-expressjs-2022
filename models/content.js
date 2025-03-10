const Base = require("./base"),
  crypto = require("node:crypto");
module.exports = class ContentModel extends Base {
    constructor(db) {
    super(db);
  }
  insert(data, callback) {
    data.ID = crypto.randomBytes(20).toString("hex");
    this.db.collection("content").insertOne(data, {}, callback || function () {});
  }
  update(data, callback) {
    this.db.collection("content").update(
      { ID: data.ID },
      data,
      {},
      callback || function () {}
    );
  }
  getlist(callback, query) {
    console.log('this.db.collection() - ', this.collection());
    this.db.collection("content")
      .find(query || {})
      .toArray(callback);
  }
  remove(ID, callback) {
    console.log('this.collection - ', this.db.collection("content"));
    this.db.collection("content").deleteMany(
      { ID: ID },
      [],
      {},
      { remove: true },
      callback || function () {}
    );
  }
};
