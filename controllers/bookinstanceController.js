const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');
const async = require('async');

// Display list of all BookInstances.
exports.bookinstance_list = (req, res, next) => {
    BookInstance.find()
        .populate('book')
        .exec( (err, list_bookinstances) => {
            if (err) {return next(err);}
            res.render('bookinstance_list', {
                title: 'Book Instance List',
                bookinstance_list: list_bookinstances
            });
        });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res, next) => {
    
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec( (err, bookinstance) => {

            if (err) {return next(err);}

            if (bookinstance == null) {
                let err = new Error('Book copy not found');
                err.status = 404;
                return next(err);
            }

            // Successful, so render.
            res.render('bookinstance_detail', {
                title: 'Book:',
                bookinstance: bookinstance
            });
        });
};

// Display BookInstance create form on GET
exports.bookinstance_create_get = (req, res, next) => {
    
    Book.find({}, 'title')
        .exec( (err, books) => {
            if (err) {return next(err);}
            // Successfull, so render.
            res.render('bookinstance_form', {
                title: 'Create BookInstance',
                book_list: books
            });
        });
};

// Handle BookInstance create on POST
exports.bookinstance_create_post = [

    // Validate fields.
    body('book', 'Book must be specified').isLength({min: 1}).trim(),
    body('imprint', 'Imprint must be specified').isLength({min: 1}).trim(),
    body('due_back', 'Invalid date').optional({checkFalsy: true}).isISO8601(),

    // Sanitize fields.
    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from the request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        let bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({}, 'title')
                .exec( (err, books) => {
                    if (err) {return next(err);}
                    // Successfull, so render.
                    res.render('bookinstance_form', {
                        title: 'Create BookInstance',
                        book_list: books,
                        selected_book: bookinstance.book._id,
                        errors: errors.array(),
                        bookinstance: bookinstance
                    });
                });
            return;
        } else {
            // Data from form is valid.
            bookinstance.save( (err) => {
                if (err) {return next(err);}
                // Successfull - redirect to new record.
                res.redirect(bookinstance.url);
            });
        }
    }
];

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = (req, res, next) => {
    
    BookInstance.findById(req.params.id)
        .exec( (err, bookinstance) => {
            if (err) {return next(err);}
            if (bookinstance == null)
                res.redirect('/catalog/bookinstances');
            // Success, so render
            res.render('bookinstance_delete', {
                title: 'Delete BookInstance',
                bookinstance: bookinstance
            });
        });
};

// Handle BookInstance delete on POST
exports.bookinstance_delete_post = (req, res, next) => {
    
    BookInstance.findByIdAndRemove(req.body.bookinstanceid, (err) => {
        if (err) {return next(err);}
        // Success - go to bookinstance list
        res.redirect('/catalog/bookinstances');
    });
};

// Display BookInstance update form on GET
exports.bookinstance_update_get = (req, res, next) => {
    
    // Get bookinstance and Books for form.
    async.parallel({
        bookinstance: (callback) => {
            BookInstance.findById(req.params.id)
                .populate('book')
                .exec(callback);
        },
        books: (callback) => {
            Book.find(callback);
        }
    }, (err, results) => {
        if (err) {return next(err);}
        if (results.bookinstance == null) {
            let err = new Error('Bookinstance not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('bookinstance_form', {
            title: 'Update BookInstance',
            book_list: results.books,
            selected_book: results.bookinstance.book._id,
            bookinstance: results.bookinstance
        });
    });
};

// Handle BookInstance update on POST
exports.bookinstance_update_post = [

    // Validate fields.
    body('book', 'Book must be specified').isLength({min: 1}).trim(),
    body('imprint', 'Imprint must be specified').isLength({min: 1}).trim(),
    body('due_back', 'Invalid date').optional({checkFalsy: true}).isISO8601(),

    // Sanitize fields.
    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Bookinstance object with escaped/trimmed data and old id.
        let bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all books for form.
            Book.find({}, 'title')
                .exec((err, books) => {
                    if (err) {return next(err);}
                    // Success.
                    res.render('bookinstance_form', {
                        title: 'Update Book',
                        book_list: books,
                        selected_book: bookinstance.book._id,
                        bookinstance: bookinstance,
                        errors: errors.array()
                    });
                });
            return;
        } else {
            // Data from form is valid. Update the record.
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, (err, thebookinstance) => {
                if (err) {return next(err);}
                // Successful - redirect to bookinstance detail page.
                res.redirect(thebookinstance.url);
            });
        }
    }
];
