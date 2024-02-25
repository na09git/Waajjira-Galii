const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { ensureAuth, ensureAdmin, ensureAdminOrWorker } = require('../middleware/auth')

const Buy = require('../models/Buy');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploadbuy');
    },
    filename: function (req, file, cb) {
        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage: storage });


// @desc Show add buy page
// @route GET /buy/addbuy
router.get('/addbuy', ensureAuth, ensureAdminOrWorker, (req, res) => {
    res.render('buy/addbuy', {
        title: 'Buy Page',
        layout: 'admin',
    });
});


// @desc Process add buy form with image upload
// @route POST /buy
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

        const newUpload = new Buy({
            ...req.body,
            user: req.user.id,
            contentType: file.mimetype,
            imageBase64: encode_image,
        });

        try {
            await newUpload.save();
            res.redirect('/bought');
            console.log("New buy with image/upload is Registered");

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


// @desc Show all buys
// @route GET /buy/index
router.get('/', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        const buy = await Buy.find()
            .populate('user')
            .sort({ createdAt: -1 })
            .lean();

        res.render('buy/index', {
            layout: 'admin',
            buy,
        });
        console.log("You can now see All Buy Here !");
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});


// @desc    Show single buy
// @route   GET /buy/:id
router.get('/:id', ensureAuth, ensureAdmin, async (req, res) => {
    try {
        let buy = await Buy.findById(req.params.id)
            .populate('user')
            .lean()

        if (!buy) {
            return res.render('error/404')
        }

        if (buy.user._id != req.user.id) {
            res.render('error/404')
        } else {
            res.render('buy/show', {
                buy,
                layout: 'admin',
            })
        }
        console.log("You can now see the buy details");
    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})



// @desc Show edit page
// @route GET /buy/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const buy = await Buy.findById(req.params.id).lean();

        if (!buy) {
            return res.render('error/404');
        }

        if (buy.user.toString() !== req.user.id) {
            return res.redirect('/bought', {
                layout: 'admin',
            });
        } else {
            res.render('buy/edit', {
                buy,
                layout: 'admin',
            });
        }
        console.log("You are in buy/edit page & can Edit this buy info");
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});


// @desc Show Update page
// @route POST /buy/:id
router.post('/:id', ensureAuth, upload.single('image'), async (req, res) => {
    try {
        let buy = await Buy.findById(req.params.id).lean();

        if (!buy) {
            console.log('buy not found');
            return res.render('error/404');
        }

        if (String(buy.user) !== req.user.id) {
            console.log('User not authorized');
            return res.redirect('/buy'), {
                layout: 'admin',
            }
        }

        const file = req.file;
        const existingImage = buy.imageBase64;

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
                contentType: buy.contentType,
                imageBase64: existingImage,
            };
        }

        // Use await here
        buy = await Buy.findOneAndUpdate(
            { _id: req.params.id },
            updatedFields,
            { new: true, runValidators: true }
        );

        console.log('buy updated successfully');
        res.redirect('/buy');
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});



// @desc Delete buy
// @route DELETE /buy/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        let buy = await Buy.findById(req.params.id).lean();

        if (!buy) {
            return res.render('error/404');
        }

        if (buy.user != req.user.id) {
            res.redirect('/bought');
        } else {
            await buy.deleteOne({ _id: req.params.id });
            res.redirect('/bought'), {
                layout: 'admin',
            }
        }
        console.log("buy Deleted Successfully !");

    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});



// @desc User buy
// @route GET /buy/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const buy = await Buy.find({
            user: req.params.userId,
        }).populate('user').lean();

        res.render('buy/index', {
            buy,
        });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});



//@desc Search buy by title
//@route GET /buy/search/:query
router.get('/search/:query', ensureAuth, ensureAdminOrWorker, async (req, res) => {
    try {
        const buy = await Buy.find({ name: new RegExp(req.query.query, 'i') })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean();
        res.render('buy/index', { buy });
        console.log("Search is working !");
    } catch (err) {
        console.log(err);
        res.render('error/404');
    }
});


module.exports = router;