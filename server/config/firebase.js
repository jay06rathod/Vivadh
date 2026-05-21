const admin = require('firebase-admin');
const path = require('path');

// Use the service account JSON file directly — avoids env var parsing issues
// with the private key (dotenv can mangle \n in PEM keys)
const serviceAccount = require(path.join(__dirname, '..', '..', 'vivadh-c081d-firebase-adminsdk-fbsvc-2c463ddf19.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;