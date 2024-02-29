const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { ensureAuth, ensureAdmin, ensureAdminOrWorker } = require('../middleware/auth')

const Registration = require('../models/Registration');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploadregistration');
    },
    filename: function (req, file, cb) {
        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({
    storage: storage,
    // Accept multiple files
    files: 5 // set the number of files you want to accept
});

// @desc Show add registration page
// @route GET /registration/addregistration
router.get('/register', ensureAuth, ensureAdminOrWorker, (req, res) => {
    res.render('registration/register', {
        title: 'registration Page',
        layout: 'admin',
    });
});


// @desc Process add registration form with image upload
// @route POST /registration
// router.post('/', ensureAuth, ensureAdminOrWorker, upload.array('images', 5), async (req, res) => {
//     try {
//         const files = req.files;

//         if (!files || files.length === 0) {
//             const error = new Error('Please choose files');
//             error.httpStatusCode = 400;
//             throw error;
//         }

//         let encode_images = [];
//         let contentTypes = [];

//         for (let i = 0; i < files.length; i++) {
//             const img = fs.readFileSync(files[i].path);
//             encode_images.push(img.toString('base64'));
//             contentTypes.push(files[i].mimetype);
//         }

//         const newUpload = new Registration({
//             ...req.body,
//             user: req.user.id,
//             imageBase64: encode_images, // Assuming you have a field called 'imageBase64' in your schema
//             contentType: contentTypes, // Assuming you have a field called 'contentType' in your schema
//         });

//         try {
//             await newUpload.save();
//             res.redirect('/registrations');
//             console.log("New registration with multiple images uploaded");

//         } catch (error) {
//             if (error.name === 'MongoError' && error.code === 11000) {
//                 return res.status(400).json({ error: `Duplicate files. Some files already exist! ` });
//             }
//             return res.status(500).json({ error: error.message || `Cannot upload files. Something is missing!` });
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(400).json({ error: err.message || 'Internal Server Error' });
//     }
// });

// Handle registration form submission
router.post('/registration', ensureAuth, ensureAdminOrWorker, upload.array('images', 5), async (req, res) => {
    try {
        // Extract form data
        const { name, tessoo, gosadaldalaa, lakkgabatee, sadarkaa, gosagt, araddaa, phone, bara, gibirawaggaa, murtiiergaiyyate, status, tin_number, lakknagahee, adabbii, body } = req.body;

        // Check if image data exists
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Access the uploaded image file
        const image = req.files.images;

        // Convert image to base64 format
        const imageBase64 = image.data.toString('base64');

        // Get the content type of the image
        const contentType = image.mimetype;

        // Create new registration record
        const registration = new Registration({
            name,
            tessoo,
            gosadaldalaa,
            lakkgabatee,
            sadarkaa,
            gosagt,
            araddaa,
            phone,
            bara,
            gibirawaggaa,
            murtiiergaiyyate,
            status,
            tin_number,
            lakknagahee,
            adabbii,
            body,
            imageBase64,
            contentType,
            // Assuming you have a user ID available in the request
            user: req.user._id // Assuming user ID is available after authentication
        });

        // Save registration record to database
        await registration.save();

        res.status(201).json({ message: 'Registration successful', registration });
    } catch (error) {
        console.error('Error occurred during registration:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
});




// @desc Show all registrations
// @route GET /registration/index
router.get('/', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        const registration = await registration.find()
            .populate('user')
            .sort({ createdAt: -1 })
            .lean();

        res.render('registration/index', {
            layout: 'admin',
            registration,
        });
        console.log("You can now see All registration Here !");
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});


// @desc    Show single registration
// @route   GET /registration/:id
router.get('/:id', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        let registration = await registration.findById(req.params.id)
            .populate('user')
            .lean()

        if (!registration) {
            return res.render('error/404')
        }

        if (registration.user._id != req.user.id) {
            res.render('error/404')
        } else {
            res.render('registration/show', {
                registration,
                layout: 'admin',
            })
        }
        console.log("You can now see the registration details");
    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})



// @desc Show edit page
// @route GET /registration/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const registration = await registration.findById(req.params.id).lean();

        if (!registration) {
            return res.render('error/404');
        }

        if (registration.user.toString() !== req.user.id) {
            return res.redirect('/registrations', {
                layout: 'admin',
            });
        } else {
            res.render('registration/edit', {
                registration,
                layout: 'admin',
            });
        }
        console.log("You are in registration/edit page & can Edit this registration info");
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});


// @desc Show Update page
// @route POST /registration/:id
router.post('/:id', ensureAuth, upload.array('images', 5), async (req, res) => {
    try {
        let registration = await registration.findById(req.params.id).lean();

        if (!registration) {
            console.log('registration not found');
            return res.render('error/404');
        }

        if (String(registration.user) !== req.user.id) {
            console.log('User not authorized');
            return res.redirect('/registration'), {
                layout: 'admin',
            }
        }

        const file = req.file;
        const existingImage = registration.imageBase64;

        let updatedFields = req.body;

        if (file) {
            const img = fs.readFileSync(file.path);
            const encode_image = img.toString('base64');
            updatedFields = {
                ...updatedFields,
                contentType: file.mimetype,
                imageBase64: encode_image,
            };
        } else {
            updatedFields = {
                ...updatedFields,
                contentType: registration.contentType,
                imageBase64: existingImage,
            };
        }

        // Use await here
        registration = await registration.findOneAndUpdate(
            { _id: req.params.id },
            updatedFields,
            { new: true, runValidators: true }
        );

        console.log('registration updated successfully');
        res.redirect('/registration');
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});



// @desc Delete registration
// @route DELETE /registration/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        let registration = await registration.findById(req.params.id).lean();

        if (!registration) {
            return res.render('error/404');
        }

        if (registration.user != req.user.id) {
            res.redirect('/registrations');
        } else {
            await registration.deleteOne({ _id: req.params.id });
            res.redirect('/registrations'), {
                layout: 'admin',
            }
        }
        console.log("registration Deleted Successfully !");

    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});



// @desc User registration
// @route GET /registration/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const registration = await registration.find({
            user: req.params.userId,
        }).populate('user').lean();

        res.render('registration/index', {
            registration,
        });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});



//@desc Search registration by title
//@route GET /registration/search/:query
router.get('/search/:query', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        const registration = await registration.find({ name: new RegExp(req.query.query, 'i') })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean();
        res.render('registration/index', { registration });
        console.log("Search is working !");
    } catch (err) {
        console.log(err);
        res.render('error/404');
    }
});


module.exports = router;