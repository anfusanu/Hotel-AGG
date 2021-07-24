const bcrypt = require('bcrypt')

module.exports = {

    login: (cred) => {
        return new Promise(async (resolve, reject) => {

            db.get().collection(process.env.COL_ADMIN).findOne({ username: cred.username })
                .then(result => {
                    if (result) {
                        bcrypt.compare(cred.password, result.password)
                            .then(check => {
                                if (check) {
                                    resolve(check)
                                } else resolve(false);
                            })
                    } else resolve(false);
                })
        });
    }

}