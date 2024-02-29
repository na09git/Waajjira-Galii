const mongoose = require('mongoose')

const WorkerSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    position: {
        type: String,
        default: 'Murtii-fi-Odiitii',
        enum: ['Murtii-fi-Odiitii', 'Sassaabbi-fi-Hordoffii-Galii', 'Barumsa-Kaffaltii-Gibiraa'],
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
