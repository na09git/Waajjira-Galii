const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { ensureAuth, ensureAdmin, ensureAdminOrWorker } = require('../middleware/auth')

const Sell = require('../models/Sell');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploadsell');
    },
    filename: function (req, file, cb) {
        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage: storage });


// @desc Show add sell page
// @route GET /sell/addsell
router.get('/addsell', ensureAuth, ensureAdminOrWorker, (req, res) => {
    res.render('sell/addsell', {
        title: 'sell Page',
        layout: 'admin',
    });
});


// @desc Process add sell form with image upload
// @route POST /sell
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

        const newUpload = new Sell({
            ...req.body,
            user: req.user.id,
            contentType: file.mimetype,
            imageBase64: encode_image,
        });

        try {
            await newUpload.save();
            res.redirect('/sells');
            console.log("New sell with image/upload is Registered");

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


// @desc Show all sells
// @route GET /sell/index
router.get('/', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        const sell = await Sell.find()
            .populate('user')
            .sort({ createdAt: -1 })
            .lean();

        res.render('sell/index', {
            sell,
            layout: 'admin',
        });
        console.log("You can now see All sell Here !");
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});


// @desc    Show single sell
// @route   GET /sell/:id
router.get('/:id', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        let sell = await Sell.findById(req.params.id)
            .populate('user')
            .lean()

        if (!sell) {
            return res.render('error/404')
        }

        if (sell.user._id != req.user.id) {
            res.render('error/404')
        } else {
            res.render('sell/show', {
                sell,
                layout: 'admin',
            })
        }
        console.log("You can now see the sell details");
    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})



// @desc Show edit page
// @route GET /sell/edit/:id
router.get('/edit/:id', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        const sell = await Sell.findById(req.params.id).lean();

        if (!sell) {
            return res.render('error/404');
        }

        if (sell.user.toString() !== req.user.id) {
            return res.redirect('/sells');
        } else {
            res.render('sell/edit', {
                sell,
                layout: 'admin',
            });
        }
        console.log("You are in sell/edit page & can Edit this sell info");
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});


// @desc Show Update page
// @route POST /sell/:id
router.post('/:id', ensureAuth, upload.single('image'), async (req, res) => {
    try {
        let sell = await Sell.findById(req.params.id).lean();

        if (!sell) {
            console.log('sell not found');
            return res.render('error/404');
        }

        if (String(sell.user) !== req.user.id) {
            console.log('User not authorized');
            return res.redirect('/sell'), {
                layout: 'admin',
            }
        }

        const file = req.file;
        const existingImage = sell.imageBase64;

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
                contentType: sell.contentType,
                imageBase64: existingImage,
            };
        }

        // Use await here
        sell = await Sell.findOneAndUpdate(
            { _id: req.params.id },
            updatedFields,
            { new: true, runValidators: true }
        );

        console.log('sell updated successfully');
        res.redirect('/sell');
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});




// @desc Delete sell
// @route DELETE /sell/:id
router.delete('/:id', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        let sell = await Sell.findById(req.params.id).lean();

        if (!sell) {
            return res.render('error/404');
        }

        if (sell.user != req.user.id) {
            res.redirect('/sells');
        } else {
            await sell.deleteOne({ _id: req.params.id });
            res.redirect('/sells');
        }
        console.log("sell Deleted Successfully !");

    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});



// @desc User sell
// @route GET /sell/user/:userId
router.get('/user/:userId', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        const sell = await Sell.find({
            user: req.params.userId,
        }).populate('user').lean();

        res.render('sell/index', {
            sell,
            layout: 'admin',
        });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});



//@desc Search sell by title
//@route GET /sell/search/:query
router.get('/search/:query', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        const sell = await Sell.find({ name: new RegExp(req.query.query, 'i') })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean();
        res.render('sell/index', {
            sell,
            layout: 'admin',
        });
        console.log("Search is working !");
    } catch (err) {
        console.log(err);
        res.render('error/404');
    }
});


module.exports = router;