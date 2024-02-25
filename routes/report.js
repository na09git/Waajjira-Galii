const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path')
const { ensureAuth } = require('../middleware/auth');

const Report = require('../models/Report')


// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploadreport');
  },
  filename: function (req, file, cb) {
    var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

const upload = multer({ storage: storage });



// @desc    Show add page
// @route   GET /report/add
// Inside your '/report/add' route
router.get('/add', ensureAuth, (req, res) => {
  try {
    console.log('Reached /report/add route');
    res.render('report/add');
  } catch (error) {
    console.error('Error rendering template:', error);
    res.status(500).send('Internal Server Error');
  }
});



// @desc Process add report form with image upload
// @route POST /report
router.post('/', ensureAuth, upload.single('image'), async (req, res) => {
  try {
    const file = req.file;

    if (!file || file.length === 0) {
      const error = new Error('Please choose image ');
      error.httpStatusCode = 400;
      throw error;
    }

    const img = fs.readFileSync(file.path);
    const encode_image = img.toString('base64');

    const newUpload = new Report({
      ...req.body,
      user: req.user.id,
      contentType: file.mimetype,
      imageBase64: encode_image,
    });

    try {
      await newUpload.save();
      res.redirect('/report');
      console.log("New report with image/upload is Posted");

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




// @desc Show all report
// @route GET /report/index
router.get('/', async (req, res) => {
  try {
    const report = await Report.find({ status: 'Public' })
      .populate('user')
      .sort({ createdAt: -1 })
      .lean();

    res.render('report/index', {
      report,
    });
    console.log("You can now see All report Here !");
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});


// @desc    Show single report
// @route   GET /report/:id
router.get('/:id', async (req, res) => {
  try {
    let report = await Report.findById(req.params.id)
      .populate('user')
      .lean()


    res.render('report/show', {
      report,
    })

    console.log("You can now see the report details");
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})




// @desc Show edit page
// @route GET /report/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).lean();

    if (!report) {
      return res.render('error/404');
    }

    if (report.user.toString() !== req.user.id) {
      return res.redirect('/report');
    } else {
      res.render('report/edit', {
        report,
      });
    }
    console.log("You are in storie/edit page & can Edit this report info");
  } catch (err) {
    console.error(err);
    return res.render('error/500');
  }
});



// @desc Show Update page
// @route POST /report/:id
router.post('/:id', ensureAuth, upload.single('image'), async (req, res) => {
  try {
    let report = await Report.findById(req.params.id).lean();

    if (!report) {
      console.log('report not found');
      return res.render('error/404');
    }

    if (String(report.user) !== req.user.id) {
      console.log('User not authorized');
      return res.redirect('/report');
    }

    const file = req.file;
    const existingImage = report.imageBase64;

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
        contentType: report.contentType,
        imageBase64: existingImage,
      };
    }

    // Use await here
    report = await Report.findOneAndUpdate(
      { _id: req.params.id },
      updatedFields,
      { new: true, runValidators: true }
    );

    console.log('report updated successfully');
    res.redirect('/report');
  } catch (err) {
    console.error(err);
    return res.render('error/500');
  }
});


// @desc Delete report
// @route DELETE /report/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let report = await Report.findById(req.params.id).lean();

    if (!report) {
      return res.render('error/404');
    }

    if (report.user != req.user.id) {
      res.redirect('/report');
    } else {
      await Report.deleteOne({ _id: req.params.id });
      res.redirect('/report');
    }
    console.log("report Deleted Successfully !");

  } catch (err) {
    console.error(err);
    return res.render('error/500');
  }
});



// @desc User report
// @route GET /report/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const report = await Report.find({
      user: req.params.userId,
    }).populate('user').lean();

    res.render('report/index', {
      report,
    });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});



//@desc Search report by title
//@route GET /report/search/:query
router.get('/search/:query', async (req, res) => {
  try {
    const report = await Report.find({ title: new RegExp(req.query.query, 'i') })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean();
    res.render('report/index', { report });
    console.log("Search is working !");
  } catch (err) {
    console.log(err);
    res.render('error/404');
  }
});


module.exports = router