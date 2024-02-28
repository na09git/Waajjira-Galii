const mongoose = require('mongoose')

const RegistrationSchema = new mongoose.Schema({
    daldalaa:
    {
        type: String,
        required: true,
    },
    gareedaldalaa: {
        type: String,
        default: 'A',
        enum: ['A', 'B', 'C'],
    },
    araddaa: {
        type: String,
        default: '01',
        enum: ['01', '02', '03'],
    },
    phone: {
        type: String,
    },
    bara: {
        type: String,
        required: true,
    },
    gibirawaggaa: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    tin_number: {
        type: String,
        required: true,
    },
    body: {
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

module.exports = mongoose.model('Registration', RegistrationSchema)
