const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path')
const { ensureAuth } = require('../middleware/auth');

const Note = require('../models/Note')


// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploadnote');
  },
  filename: function (req, file, cb) {
    var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

const upload = multer({ storage: storage });



// @desc    Show add page
// @route   GET /note/add
// Inside your '/note/add' route
router.get('/add', ensureAuth, (req, res) => {
  try {
    console.log('Reached /note/add route');
    res.render('note/add', {
      layout: 'admin',
    });
  } catch (error) {
    console.error('Error rendering template:', error);
    res.status(500).send('Internal Server Error');
  }
});



// @desc Process add note form with image upload
// @route POST /note
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

    const newUpload = new Note({
      ...req.body,
      user: req.user.id,
      contentType: file.mimetype,
      imageBase64: encode_image,
    });

    try {
      await newUpload.save();
      res.redirect('/note', {
        layout: 'admin',
      });
      console.log("New note with image/upload is Posted");

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




// @desc Show all note
// @route GET /note/index
router.get('/', async (req, res) => {
  try {
    const note = await Note.find()
      .populate('user')
      .sort({ createdAt: -1 })
      .lean();

    res.render('note/index', {
      note,
      layout: 'admin',
    });
    console.log("You can now see All note Here !");
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});


// @desc    Show single note
// @route   GET /note/:id
router.get('/:id', async (req, res) => {
  try {
    let note = await Note.findById(req.params.id)
      .populate('user')
      .lean()


    res.render('note/show', {
      note,
      layout: 'admin',
    })

    console.log("You can now see the note details");
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})




// @desc Show edit page
// @route GET /note/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).lean();

    if (!note) {
      return res.render('error/404');
    }

    if (note.user.toString() !== req.user.id) {
      return res.redirect('/note');
    } else {
      res.render('note/edit', {
        note,
        layout: 'admin',
      });
    }
    console.log("You are in storie/edit page & can Edit this note info");
  } catch (err) {
    console.error(err);
    return res.render('error/500');
  }
});



// @desc Show Update page
// @route POST /note/:id
router.post('/:id', ensureAuth, upload.single('image'), async (req, res) => {
  try {
    let note = await Note.findById(req.params.id).lean();

    if (!note) {
      console.log('note not found');
      return res.render('error/404');
    }

    if (String(note.user) !== req.user.id) {
      console.log('User not authorized');
      return res.redirect('/note', {
        layout: 'admin',
      });
    }

    const file = req.file;
    const existingImage = note.imageBase64;

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
        contentType: note.contentType,
        imageBase64: existingImage,
      };
    }

    // Use await here
    note = await Note.findOneAndUpdate(
      { _id: req.params.id },
      updatedFields,
      { new: true, runValidators: true }
    );

    console.log('note updated successfully');
    res.redirect('/note');
  } catch (err) {
    console.error(err);
    return res.render('error/500');
  }
});


// @desc Delete note
// @route DELETE /note/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id).lean();

    if (!note) {
      return res.render('error/404');
    }

    if (note.user != req.user.id) {
      res.redirect('/note', {
        layout: 'admin',
      });
    } else {
      await note.deleteOne({ _id: req.params.id });
      res.redirect('/note', {
        layout: 'admin',
      });
    }
    console.log("note Deleted Successfully !");

  } catch (err) {
    console.error(err);
    return res.render('error/500');
  }
});



// @desc User note
// @route GET /note/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const note = await Note.find({
      user: req.params.userId,
    }).populate('user').lean();

    res.render('note/index', {
      note,
      layout: 'admin',
    });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});


//@desc Search note by title
//@route GET /note/search/:query
router.get('/search/:query', async (req, res) => {
  try {
    const note = await Note.find({ title: new RegExp(req.query.query, 'i') })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean();
    res.render('note/index', {
      note,
      layout: 'admin',
    });
    console.log("Search is working !");
  } catch (err) {
    console.log(err);
    res.render('error/404');
  }
});


module.exports = router