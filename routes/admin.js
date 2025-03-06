const BaseController = require("./base"),
  View = require("../views/base");
const model = new (require("../models/content"))();
module.exports = new (class AdminController extends BaseController {
  constructor() {
    super("admin");
  }
  run(req, res, next) {
    model.setDB(req.db);
    console.log('Inside admin');
    model.insert(req, function (listMarkup) {
      v.render({
        title: "Administration",
        content: "Welcome to the control panel",
        list: listMarkup,
        form: formMarkup,
      });
    });
    //if (this.authorize(req)) {
      //req.session.fastdelivery = true;
      //req.session.save(function (err) {
        model.remove(req, function () {
          this.form(req, res, function (formMarkup) {
            this.list(function (listMarkup) {
              v.render({
                title: "Administration",
                content: "Welcome to the control panel",
                list: listMarkup,
                form: formMarkup,
              });
            });
          });
        });
        const v = new View(res, "admin");
        v.render({
          title: "Administration",
          content: "Welcome to the control panel",
        });
      //});
    /* } else {
      const v = new View(res, "admin-login");
      v.render({
        title: "Please login",
      });
    } */
  }
  authorize(req) {
    console.log('req.session - ', req.session);
    return (
      (req.session &&
        req.session.fastdelivery &&
        req.session.fastdelivery === true) ||
      (req.body &&
        req.body.username === this.username &&
        req.body.password === this.password)
    );
  }
  handleFileUpload(req) {
    if (!req.files || !req.files.picture || !req.files.picture.name) {
      return req.body.currentPicture || "";
    }
    const data = fs.readFileSync(req.files.picture.path);
    const fileName = req.files.picture.name;
    const uid = crypto.randomBytes(10).toString("hex");
    const dir = __dirname + "/../public/uploads/" + uid;
    fs.mkdirSync(dir, "0777");
    fs.writeFileSync(dir + "/" + fileName, data);
    return "/uploads/" + uid + "/" + fileName;
  }
})();
