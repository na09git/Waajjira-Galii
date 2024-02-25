const mongoose = require('mongoose')
const multer = require('multer');

const WorkerSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true,
    },
    email: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
    },
    position: {
        type: String,
        default: 'Worker',
        enum: ['Worker', 'Partner', 'Children', 'Wife', 'Driver', 'Security', 'Cashier', 'Director'],
    },
    salary: {
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

module.exports = mongoose.model('Worker', WorkerSchema)
