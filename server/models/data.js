/**
 * Created by pin on 5/4/15.
 */

var mongoose = require('mongoose')

var dataSchema = mongoose.Schema({
    userid : {type: String},
    data: {type: Object}
})

var Data = mongoose.model('Data', dataSchema)

module.exports = Data