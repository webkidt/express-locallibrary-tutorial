const Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

// Display list of all Genres.
exports.genre_list = (req, res, next) => {

	Genre.find()
		.sort([['name', 'ascending']])
		.exec( (err, list_genres) => {

			if (err) {return next(err);}
			
			res.render('genre_list', {
				title: 'Genre List',
				genre_list: list_genres
			});
		});
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
	
	async.parallel({
		genre: (callback) => {
			Genre.findById(req.params.id)
				.exec(callback);
		},

		genre_books: (callback) => {
			Book.find({'genre': req.params.id})
				.exec(callback);
		},
	}, (err, results) => {

		if (err) {return next(err);}

		if (results.genre == null) { // No results.
			let err = new Error('Genre not found');
			err.status = 404;
			return next(err);
		}

		// Successful, so render
		res.render('genre_detail', {
			title: 'Genre Detail',
			genre: results.genre,
			genre_books: results.genre_books
		});
	});
};

// Display Genre create form on GET
exports.genre_create_get = (req, res, next) => {
	
	res.render('genre_form', {title: 'Create Genre'});
};

// Handle Genre create on POST
exports.genre_create_post = [

	// Validate that the name field is not empty
	body('name', 'Genre name required').isLength({min: 1}).trim(),

	// Sanitize (trim and escape) the name field.
	sanitizeBody('name').trim().escape(),

	// Process request after validation and sanitization.
	(req, res, next) => {

		// Extract the validation errors from the request
		const errors = validationResult(req);

		// Create a genre object with escaped and trimmed data.
		let genre = new Genre(
			{name: req.body.name}
		);

		if (!errors.isEmpty()) {
			// There are errors. Render the form again with sanitized values/error messages.
			res.render('genre_form', {
				title: 'Create Genre',
				genre: genre,
				errors: errors.array()
			});
			return;
		} else {
			// Data from form is valid.
			// Check if Genre with same name already exists.
			Genre.findOne({'name': req.body.name})
				.exec( (err, found_genre) => {
					
					if (err) {return next(err);}

					if (found_genre) {
						// Genre exists, redirect to its detail page.
						res.redirect(found_genre.url);
					} else {
						genre.save( (err) => {
							if (err) {return next(err);}
							// Genre saved. Redirect to genre details page.
							res.redirect(genre.url);
						});
					}
				});
		}
	}
];

// Display Genre delete form on GET
exports.genre_delete_get = (req, res, next) => {
	
	async.parallel({
		genre: (callback) => {
			Genre.findById(req.params.id)
				.exec(callback);
		},
		genres_books: (callback) => {
			Book.find({'genre': req.params.id})
				.exec(callback);
		},
	}, (err, results) => {
		if (err) {return next(err);}
		if (results.genre == null)
			res.redirect('/catalog/genres');
		// Successful, so render.
		res.render('genre_delete', {
			title: 'Delete Genre',
			genre: results.genre,
			genre_books: results.genres_books
		});
	});
};

// Handle Genre delete on POST
exports.genre_delete_post = (req, res, next) => {
	
	async.parallel({
		genre: (callback) => {
			Genre.findById(req.body.genreid)
				.exec(callback);
		},
		genres_books: (callback) => {
			Book.find({'genre': req.body.genreid})
				.exec(callback);
		},
	}, (err, results) => {
		if (err) {return next(err);}
		// Success
		if (results.genres_books.length > 0) {
			// Genre has books. Render in same way as GET route.
			res.render('genre_delete', {
				title: 'Delete Genre',
				genre: results.genre,
				genre_books: results.genres_books
			});
			return;
		} else {
			// Genre has no books. Delete object and redirect to the list of genres.
			Genre.findByIdAndRemove(req.body.genreid, (err) => {
				if (err) {return next(err);}
				// Success - go to author list
				res.redirect('/catalog/genres');
			});
		}
	});
};

// Display Genre update form on GET
exports.genre_update_get = (req, res, next) => {
	
	// Get genre for form.
	Genre.findById(req.params.id)
		.exec( (err, genre) => {
			if (err) {return next(err);}
			if (genre == null) {
				let err = new Error('Genre not found');
				err.status = 404;
				return next(err);
			}
			res.render('genre_form', {
				title: 'Update Genre',
				genre: genre
			});
		});
};

// Handle Genre update on POST
exports.genre_update_post = [

	// Validate fields.
	body('name', 'Genre name required.').isLength({min: 1}).trim(),

	// Sanitize fields.
	sanitizeBody('name').trim().escape(),

	// Process request after validation and sanitization.
	(req, res, next) => {

		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a Genre object with escaped/trimmed data and old id.
		let genre = new Genre({
			name: req.body.name,
			_id: req.params.id
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized value/error messages.
			res.render('genre_form', {
				title: 'Update Genre',
				genre: genre
			});
			return;
		} else {
			Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, thegenre) => {
				if (err) {return next(err);}
				// Successful - redirect to book detail page.
				res.redirect(thegenre.url);
			});
		}
	}
];