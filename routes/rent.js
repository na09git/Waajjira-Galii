const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { ensureAuth, ensureAdmin, ensureAdminOrWorker } = require('../middleware/auth')

const Rent = require('../models/Rent');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploadrent');
    },
    filename: function (req, file, cb) {
        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage: storage });


// @desc Show add rent page
// @route GET /rent/addrent
router.get('/addrent', ensureAuth, ensureAdminOrWorker, (req, res) => {
    res.render('rent/addrent', {
        title: 'rent Page',
        layout: 'admin',
    });
});


// @desc Process add rent form with image upload
// @route POST /rent
router.post('/', ensureAuth, ensureAdminOrWorker, upload.single('image'), async (req, res) => {
    try {
        const file = req.file;

        if (!file || file.length === 0) {
            const error = new Error('Please choose files');
            error.httpStatusCode = 400;
            throw error;
        }

        const img = fs.readFileSync(file.path);
        const encode_image = img.toString('base64');

        const newUpload = new Rent({
            ...req.body,
            user: req.user.id,
            contentType: file.mimetype,
            imageBase64: encode_image,
        });

        try {
            await newUpload.save();
            res.redirect('/rents');
            console.log("New rent with image/upload is Registered");

        } catch (error) {
            if (error.name === 'MongoError' && error.code === 11000) {
                return res.status(400).json({ error: `Duplicate ${file.originalname}. File Already exists! ` });
            }
            return res.status(500).json({ error: error.message || `Cannot Upload ${file.originalname} Something Missing!` });
        }
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message || 'Internal Server Error' });
    }
});


// @desc Show all rents
// @route GET /rent/index
router.get('/', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        const rent = await Rent.find()
            .populate('user')
            .sort({ createdAt: -1 })
            .lean();

        res.render('rent/index', {
            rent,
            layout: 'admin',
        });
        console.log("You can now see All Rent Here !");
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});


// @desc    Show single rent
// @route   GET /rent/:id
router.get('/:id', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        let rent = await Rent.findById(req.params.id)
            .populate('user')
            .lean()

        if (!rent) {
            return res.render('error/404')
        }

        if (rent.user._id != req.user.id) {
            res.render('error/404')
        } else {
            res.render('rent/show', {
                rent,
                layout: 'admin',
            })
        }
        console.log("You can now see the rent details");
    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})



// @desc Show edit page
// @route GET /rent/edit/:id
router.get('/edit/:id', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        const rent = await Rent.findById(req.params.id).lean();

        if (!rent) {
            return res.render('error/404');
        }

        if (rent.user.toString() !== req.user.id) {
            return res.redirect('/rents');
        } else {
            res.render('rent/edit', {
                rent,
                layout: 'admin',
            });
        }
        console.log("You are in rent/edit page & can Edit this rent info");
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});


// @desc Show Update page
// @route POST /rent/:id
router.post('/:id', ensureAuth, upload.single('image'), async (req, res) => {
    try {
        let rent = await Rent.findById(req.params.id).lean();

        if (!rent) {
            console.log('rent not found');
            return res.render('error/404');
        }

        if (String(rent.user) !== req.user.id) {
            console.log('User not authorized');
            return res.redirect('/rent'), {
                layout: 'admin',
            }
        }

        const file = req.file;
        const existingImage = rent.imageBase64;

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
                contentType: rent.contentType,
                imageBase64: existingImage,
            };
        }

        // Use await here
        rent = await Rent.findOneAndUpdate(
            { _id: req.params.id },
            updatedFields,
            { new: true, runValidators: true }
        );

        console.log('rent updated successfully');
        res.redirect('/rent');
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});




// @desc Delete rent
// @route DELETE /rent/:id
router.delete('/:id', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        let rent = await Rent.findById(req.params.id).lean();

        if (!rent) {
            return res.render('error/404');
        }

        if (rent.user != req.user.id) {
            res.redirect('/rents');
        } else {
            await rent.deleteOne({ _id: req.params.id });
            res.redirect('/rents');
        }
        console.log("rent Deleted Successfully !");

    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});



// @desc User rent
// @route GET /rent/user/:userId
router.get('/user/:userId', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        const rent = await Rent.find({
            user: req.params.userId,
        }).populate('user').lean();

        res.render('rent/index', {
            rent,
            layout: 'admin',
        });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});



//@desc Search rent by title
//@route GET /rent/search/:query
router.get('/search/:query', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        const rent = await Rent.find({ name: new RegExp(req.query.query, 'i') })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean();
        res.render('rent/index', {
            rent,
            layout: 'admin',
        });
        console.log("Search is working !");
    } catch (err) {
        console.log(err);
        res.render('error/404');
    }
});


module.exports = router;