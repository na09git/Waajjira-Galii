const mongoose = require('mongoose')

const RentSchema = new mongoose.Schema({
    renter: {
        type: String,
        required: true,
    },
    place: {
        type: String,
        default: 'Kombolcha',
        enum: ['Kombolcha', 'Harar'],
    },
    phone: {
        type: String,
    },
    birr: {
        type: String,
        required: true,
    },
    bara: {
        type: String,
        default: '2016',
        enum: ['2016', '2017', '2018']
    },
    month1: {
        type: String,
        default: 'Not-Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    body1: {
        type: String,
    },
    month2: {
        type: String,
        default: 'Not-Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    body2: {
        type: String,
    },
    month3: {
        type: String,
        default: 'Not-Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    body3: {
        type: String,
    },
    month4: {
        type: String,
        default: 'Not-Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    body4: {
        type: String,
    },
    month5: {
        type: String,
        default: 'Not-Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    body5: {
        type: String,
    },
    month6: {
        type: String,
        default: 'Not-Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    body6: {
        type: String,
    },
    month7: {
        type: String,
        default: 'Not-Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    body7: {
        type: String,
    },
    month8: {
        type: String,
        default: 'Not-Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    body8: {
        type: String,
    },
    month9: {
        type: String,
        default: 'Not-Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    body9: {
        type: String,
    },
    month10: {
        type: String,
        default: 'Not-Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    body10: {
        type: String,
    },
    month11: {
        type: String,
        default: 'Not-Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    body11: {
        type: String,
    },
    month12: {
        type: String,
        default: 'Not-Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    body12: {
        type: String,
    },
    imageBase64: {
        type: String,
        required: true,
    },
    contentType: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('Rent', RentSchema)
