const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

let AuthorSchema = new Schema({
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
});

// Virtual for author's full name
AuthorSchema
.virtual('name')
.get(function() {
    return this.family_name + ', ' + this.first_name;
});

// Virtual for Date of Birth input date format
AuthorSchema
.virtual('date_of_birth_input_format')
.get(function() {
    return moment(this.date_of_birth).format('YYYY-MM-DD');
});

// Virtual for Date of Death input date format
AuthorSchema
.virtual('date_of_death_input_format')
.get(function() {
    return moment(this.date_of_death).format('YYYY-MM-DD');
});

// Virtual for author's lifespan
AuthorSchema
.virtual('lifespan')
.get(function() {
    let birth = this.date_of_birth ? moment(this.date_of_birth).format('YYYY-MM-DD') : '';
    let death = this.date_of_death ? moment(this.date_of_death).format('YYYY-MM-DD') : '';
    // let death = this.date_of_death ? moment(this.date_of_death).format('YYYY-MM-DD') : '';
    return `${birth} - ${death}`;
    // return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
});

// Virtual for author's URL
AuthorSchema
.virtual('url')
.get(function() {
    return '/catalog/author/' + this._id;
});

// Export model
module.exports = mongoose.model('Author', AuthorSchema);