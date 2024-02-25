const mongoose = require('mongoose')

const SellSchema = new mongoose.Schema({
    seller: {
        type: String,
        required: true,
    },
    buyer_name: {
        type: String,
        required: true,
    },
    material: {
        type: String,
        default: 'Dinicha',
        enum: ['Dinicha', 'Karot', 'Kurumba', 'Qayasir', 'Shunkurtaa', 'Shukaar', 'Timaatim', 'Luqqaa', 'Joniya', 'Other'],
    },
    kilogram: {
        type: String,
    },
    birr: {
        type: String,
        required: true,
    },
    note: {
        type: String,
    },
    phone: {
        type: String,
    },
    status: {
        type: String,
        default: 'Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    imageBase64: {
        type: String,
        required: true,
    },
    contentType: {
        type: String,
        required: true,
    },
    car_id: {
        type: String,
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

module.exports = mongoose.model('Sell', SellSchema)
