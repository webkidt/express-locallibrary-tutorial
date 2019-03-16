const mongoose = require('mongoose');

// Set up default mongoose connection
const mongoDB = 'mongodb://127.0.0.1/my_database';
mongoose.connect(mongoDB, {useNewUrlParser: true});
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
// Get the default connection
var db = mongoose.connection;
var Schema = mongoose.Schema;
// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    var animalSchema = new Schema({name: String, type: String});
    // animalSchema.methods.findThis = function() {
    //     console.log(this.type);
    // };
    animalSchema
    .virtual('name_type')
    .get(function() {
        return this.type;
    });
    var Animal = mongoose.model('Animal', animalSchema);
    var dog = new Animal({type: 'dog'});
    console.log(dog.name_type);
});
