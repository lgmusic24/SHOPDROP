var express = require("express");
var app= express();
var mongoose       = require('mongoose');
var bodyParser = require("body-parser");
var methodOverride = require('method-override');


//configuration
var db = require('./configure/db');

// set our port
var port = process.env.PORT || 8080

// get all data/stuff of the body (POST) parameters
//parse application/json
app.use(bodyParser.json());

//parse application/vnd.api + json as json
app.use(bodyParser.json({ type : 'application/vnd.api+json'}));

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true}));

//override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

// set the static files location /public/img will be /img for users
app.use(express.static(_dirname + '/public'));

// routes
require('./app/routes')(app); // configure out routes

// start app
// startup our app at http://localhost:8080
app.listen(port)

//shout to user
console.log('Hello World on port' + port);

//expose app
exports = module.exports = app;







// var CONTACTS_COLLECTION = "contacts";

var app = express();
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// CONTACTS API ROUTES BELOW


// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/api/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get("/api/contacts", function(req, res) {
  db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
      if (err) {
        handleError(res, err.message, "Failed to get contacts.");
      } else {
        res.status(200).json(docs);
      }
    });
  });

app.post("/api/contacts", function(req, res) {
  var newContact = req.body;
    newContact.createDate = new Date();

    if (!req.body.name) {
      handleError(res, "Invalid user input", "Must provide a name.", 400);
    }

    db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to create new contact.");
      } else {
        res.status(201).json(doc.ops[0]);
      }
    });
  });


/*  "/api/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */
 app.get("/api/contacts", function(req, res) {
   db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
     if (err) {
       handleError(res, err.message, "Failed to get contacts.");
     } else {
       res.status(200).json(docs);
     }
   });
 });

 app.put("/api/contacts/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update contact");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});

app.delete("/api/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete contact");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});
