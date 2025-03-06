const BaseController = require("./base"),
  View = require("../views/base");
const model = new (require("../models/content"))();
module.exports = new (class HomeController extends BaseController {
  constructor() {
    super("Home");
    this.content = null;
  }
  run(req, res, next) {
    console.log('req.db in index.js - ', req.db);
    model.setDB(req.db);
    const self = this;
    this.getContent(function () {
      const v = new View(res, "index");
      v.render(self.content);
    });
  }
  getContent(callback) {
    const self = this;
    this.content = {};
    model.getlist(
      function (err, records) {
        // ... storing data to content object
        model.getlist(
          function (err, records) {
            // ... storing data to content object
            callback();
          },
          { type: "blog" }
        );
      },
      { type: "home" }
    );
  }
})();
