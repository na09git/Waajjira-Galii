const express = require('express')
const passport = require('passport')
const { ensureAuth, ensureAdmin } = require('../middleware/auth')
const router = express.Router()

const User = require('../models/User')
const Sell = require('../models/Sell');



// @route   GET /home
router.get('/admin', ensureAdmin, async (req, res) => {
  try {
    const user = req.user;
    const sells = await Sell.find().populate('user').lean();

    res.render('admin', {
      layout: admin,
      user: req.user, // Pass the user to the template if needed
      sells: sells // Pass sell data to the template// Pass the user to the template
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})



//@desc Search admin by title
//@route GET /admin/search/:query
router.get('/search/:query', ensureAuth, async (req, res) => {
  try {
    const admin = await Admin.find({ name: new RegExp(req.query.query, 'i') })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean();
    res.render('admin/index', {
      admin,
      layout: 'admin',
    });
    console.log("Search is working !");
  } catch (err) {
    console.log(err);
    res.render('error/404');
  }
});

module.exports = router