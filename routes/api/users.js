const express = require('express');
const User = require('../../models/User');
const router = express.Router()
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../configs/keys')
const passport = require('passport')



//load validator
const validateRegisterInput = require('../../validation/register')
const ValidateLoginInput = require('../../validation/login')

//@route GET /api/users/test
//@desc Test users route
//@access public
router.get('/test', (req, res) => res.json({ msg: "Users module works" }));

//@route POST /api/users/register
//@desc Register user
//@access public
router.post('/register', (req, res) => {

    const { errors, isValid } = validateRegisterInput(req.body)
    if (!isValid) {
        return res.status(400).json(errors)
    }

    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                errors.email = "Email alreaddy exists"
                return res.status(400).json(errors)
            }
            else {
                const avatar = gravatar.url(req.body.email, { s: '200', r: 'pg', d: 'mm' })
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    avatar: avatar

                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                console.log('CREATE USER', user);
                                res.json(user)
                            })
                            .catch(err => console.log(err))
                    })
                })

            }
        })
});


//@route POST /api/users/login
//@desc Login user
//@access public
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const { errors, isValid } = ValidateLoginInput(req.body)

    if (!isValid) {

        return res.status(400).json(errors)
    }
    //Check for user
    User.findOne({ email })
        .then(user => {
            if (!user) {
                errors.email = "User not Found"
                return res.status(404).json(errors)
            }
            bcrypt.compare(password, user.password)
                .then(ismatch => {
                    if (ismatch) {
                        const payload = { id: user.id, name: user.name, avatar: user.avatar }

                        //sign Token
                        jwt.sign(payload, keys.secret_key, { expiresIn: 3600 },
                            (err, token) => {
                                console.log('LOGIN REQUEST');
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                });
                            })
                    } else {
                        errors.password = "Password Incorrect"
                        return res.status(400).json(errors)
                    }
                })
        })
});


//@route POST /api/users/current
//@desc Return current user
//@access private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    })
})

module.exports = router;