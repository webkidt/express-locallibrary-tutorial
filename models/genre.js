const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let GenreSchema = new Schema({
    name: {type: String, min: 3, max: 100, required: true}
});

// Virtual for Genre's URL
GenreSchema
.virtual('url')
.get(function() {
    return '/catalog/genre/' + this._id;
});

// Export model
module.exports = mongoose.model('Genre', GenreSchema);