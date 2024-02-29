const mongoose = require('mongoose')

const RegistrationSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true,
    },
    tessoo: {
        type: String,
    },
    gosadaldalaa: {
        type: String,
        default: 'Muramaa',
        enum: ['Muramaa', 'Tilmaama-1101', 'Tilmaama-1103', 'Tilmaama-ToT', 'Tilmaama-VAT-1199'],
    },
    lakkgabatee: {
        type: String,
    },
    sadarkaa: {
        type: String,
        default: 'A',
        enum: ['A', 'B', 'C'],
    },
    gosagt: {
        type: String,
        default: '1101',
        enum: ['1101', '1103', 'ToT', 'VAT-1199'],
    },
    araddaa: {
        type: String,
        default: 'magaalaa_01',
        enum: ['Araddaa_01', 'Araddaa_02', 'Laga-Haamaa', 'Iftoha', 'Samargeel', 'Sibilu', 'H-Bilisummaa', 'Tuulaa', 'G-Raaboo', 'Sarkama', 'Saamte', 'Ijiginnaa', 'Qeerrensa', 'Bilisummaa', 'Eeguu', 'W-Mohammed', 'Wadddeessa', 'Bu-Nagayaa', 'Bakkee', 'Bu-Diin', 'Xaaxessaa', 'W-Lameen', 'Qaqalli'],
    },
    phone: {
        type: String,
    },
    gibirawagaa15: {
        type: String,
    },
    murtiiergaiyyate15: {
        type: String,
    },
    bara15: {
        type: String,
        default: '2015-PAID',
        enum: ['2015-PAID', '2015-NOT-PAID'],
    },
    gibirawagaa16: {
        type: String,
    },
    murtiiergaiyyate16: {
        type: String,
    },
    bara16: {
        type: String,
        default: '2016-NOT-PAID',
        enum: ['2016-PAID', '2016-NOT-PAID'],
    },
    gibirawagaa17: {
        type: String,
    },
    murtiiergaiyyate17: {
        type: String,
    },
    bara17: {
        type: String,
        default: '...We-Are-Approaching-2017',
        enum: ['...We-Are-Approaching-2017', '2017-PAID', '2017-NOT-PAID'],
    },
    gibirawagaa18: {
        type: String,
    },
    murtiiergaiyyate18: {
        type: String,
    },
    bara18: {
        type: String,
        default: '...We-Are-Approaching-2018',
        enum: ['...We-Are-Approaching-2018', '2018-PAID', '2018-NOT-PAID'],
    },
    gibirawagaa19: {
        type: String,
    },
    murtiiergaiyyate19: {
        type: String,
    },
    bara19: {
        type: String,
        default: '...We-Are-Approaching-2019',
        enum: ['...We-Are-Approaching-2019', '2019-PAID', '2019-NOT-PAID'],
    },
    gibirawagaa20: {
        type: String,
    },
    murtiiergaiyyate20: {
        type: String,
    },
    bara20: {
        type: String,
        default: '...We-Are-Approaching-2020',
        enum: ['...We-Are-Approaching-2020', '2020-PAID', '2020-NOT-PAID'],
    },
    tin_number: {
        type: String,
    },
    lakknagahee: {
        type: String,
    },
    adabbii: {
        type: String,
        default: 'Dhalabaankii',
        enum: ['Dhalabaankii', 'Adabbii'],
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
