const bcrypt = require('bcrypt')
const chance = require('chance').Chance();


module.exports = {

    landingPage : (callback) => {
        db.get().collection(process.env.COL_LANDINGS).find({}).toArray()
        .then(result => {
            callback(result)
        })

    }
}