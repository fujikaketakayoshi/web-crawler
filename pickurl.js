const Datastore = require('nedb');
const db = new Datastore({
    filename: 'links.db',
    autoload: true
});

db.find({checked_at: null}).limit(1).exec( (error, docs) => {
    console.log(docs[0].url);
});
