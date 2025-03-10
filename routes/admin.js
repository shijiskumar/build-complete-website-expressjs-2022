const BaseController = require("./base"),
  View = require("../views/base");
const model = new (require("../models/content"))();
const fs = require('fs');
const handlebars = require('handlebars');
const path = require("path");

// Define the available options for type
const availableTypes = [
  { value: 'blog', label: 'blog' },
  { value: 'home', label: 'home' },
  { value: 'services', label: 'services' },
  { value: 'careers', label: 'careers' },
  { value: 'contacts', label: 'contacts' }
];

module.exports = new (class AdminController extends BaseController {
  constructor() {
    super("admin");
  }
  run(req, res, next) {
    const v = new View(res, "admin");
    model.setDB(req.db);
    console.log('Inside admin');
    //if (this.authorize(req)) {
      //req.session.fastdelivery = true;
      //req.session.save(function (err) {
        this.del(req, () => {
          this.form(req, res, (formMarkup) => {
            this.list(req, (listMarkup) => {
              console.log("Headers already sent - in list:", res.headersSent);
              /* if (res.headersSent) {
                // If headers already sent, delegate to default Express error handler
                return next();
              } */
              v.render({
                title: "Administration",
                content: "Welcome to the control panel - in list",
                list: listMarkup,
                form: formMarkup,
              });
            });
          });
        });
        console.log("Headers already sent - out of list:", res.headersSent);
        v.render({
          title: "Administration",
          content: "Welcome to the control panel - out of list",
          list: listMarkup,
          form: formMarkup,
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

  del(req, callback) {
    const { action, id } = req.query;  // Get query parameters

    if (action === 'delete' && id) {  // Check if delete action is requested
        req.db.collection('content').deleteOne({ _id: new require('mongodb').ObjectId(id) }, (err, result) => {
            if (err) {
                console.error('Error deleting record:', err);
            } else {
                console.log(`Deleted ${result.deletedCount} record(s).`);
            }
            callback();  // Proceed to the next function
        });
    } else {
        callback();  // No delete action, proceed to the next function
    }
  }

  form(req, res, callback) {
    let { id } = req.query;
    console.log('id ----- ', id);
    if (req.body && req.body.ID) 
      id = req.body.ID;
    console.log('id ==> ', id);
    const collection = req.db.collection('content');
    
    if (req.method === 'POST') {  // Form submitted
        const { title, text, type, currentPicture } = req.body;
        let picture = currentPicture;

        if (req.files && req.files.picture) {  // Handle file upload
            const pictureFile = req.files.picture;
            picture = `/uploads/${pictureFile.name}`;
            pictureFile.mv(`./public${picture}`);
        }

        if (id) {  // Update existing record
            collection.updateOne(
                { _id: new require('mongodb').ObjectId(id) },
                { $set: { title, text, type, picture } },
                (err) => {
                    if (err) console.error('Error updating record:', err);
                    this.renderForm({}, callback);
                }
            );
        } else {  // Create new record
            collection.insertOne(
                { title, text, type, picture }, 
                (err) => {
                    if (err) console.error('Error inserting record:', err);
                    this.renderForm({}, callback);
            });
        }
    } else if (id) {  // Edit form requested
        collection.findOne({ _id: new require('mongodb').ObjectId(id) }, (err, record) => {
            if (err) console.error('Error fetching record:', err);
            this.renderForm(record, callback);  // Render form with existing data
        });
    } else {  // Display empty form
        this.renderForm({}, callback);
    }
  }

  renderForm(record, callback) {
    if (record) {
      const { _id = '', title = '', text = '', picture = ''} = record;
      let type = record.type;
      
      // Transform type into <option> tags
      const typeOptions = availableTypes.map(t => {
        const selected = t.value === type ? 'selected' : '';
        return `<option value="${t.value}" ${selected}>${t.label}</option>`;
      }).join('');
      if (typeOptions)
        type = typeOptions;

      const formTemplate = path.join(__dirname, "../templates/admin-record.hbs");

      fs.readFile(formTemplate, 'utf-8', (err, templateData) => {
          if (err) {
              console.error('Error loading form template:', err);
              return callback('<p>Error loading form.</p>');
          }
          const template = handlebars.compile(templateData);
          const formMarkup = template({
              ID: _id,
              title,
              text,
              type,
              picture
          });
          callback(formMarkup);
      });
    } else {
      this.renderForm({}, callback);
    }
  }

  list(req, callback) {
    req.db.collection('content').find().toArray((err, records) => {
        if (err) {
            console.error('Error fetching records:', err);
            callback('<p>Error loading list.</p>');
            return;
        }

        let listMarkup = '<table border="1"><tr><th>Title</th><th>Type</th><th>Actions</th></tr>';
        records.forEach(record => {
            listMarkup += `
                <tr>
                    <td>${record.title}</td>
                    <td>${record.type}</td>
                    <td>
                        <a href="?action=edit&id=${record._id}">Edit</a> |
                        <a href="?action=delete&id=${record._id}" onclick="return confirm('Are you sure?')">Delete</a>
                    </td>
                </tr>`;
        });
        listMarkup += '</table>';
        callback(listMarkup);
    });
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
