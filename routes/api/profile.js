const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const passport = require('passport')

//load profile model
const Profile = require('../../models/Profile')
//load User Model
const User = require('../../models/User')

//load Validator
const validateProfileInput = require('../../validation/profile')
const ValidateExperienceInput = require('../../validation/experience')
const ValidateEducationInput = require('../../validation/education')

//@route GET /api/profile/test
//@desc Test profile route
//@access public
router.get('/test', (req, res) => res.json({ msg: "Profile module works" }));

//@route GET /api/profile
//@desc Return Current User Profile
//@access private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {}
    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = "No profile found with this user"
                return res.status(404).json(errors)
            }
            console.log('GET PROFILE', profile);
            return res.json(profile)
        }).catch(err => res.status(404).json(err))
})


//@route GET /api/profile/handle/:handle
//@desc Get profile by Handle
//@access public
router.get('/handle/:handle', (req, res) => {
    const errors = {}
    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile with this handle'
                return res.status(404).json(errors)
            }
            return res.json(profile)
        })
        .catch(err => res.status(404).json(err))
})


//@route GET /api/profile/user/:user_id
//@desc Get Profile by user_id
//@access public
router.get('/user/:user_id', (req, res) => {
    const errors = {}
    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile with this user_id'
                return res.status(404).json(errors)
            }
            return res.json(profile)
        })
        .catch(err => res.status(404).json(err))
})


//@route GET /api/profile/all
//@desc Get all Profiles
//@access public
router.get('/all', (req, res) => {
    const errors = {}
    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles) {
                errors.noprofile = 'There is no profile'
                return res.status(404).json(errors)
            }
            return res.json(profiles)
        })
        .catch(err => res.status(404).json(err))
})


//@route POST /api/profile
//@desc create and edit profile
//@access private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    //Check Validation
    const { errors, isValid } = validateProfileInput(req.body)

    if (!isValid) {
        console.log(errors)
        return res.status(400).json(errors)
    }
    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
        profileFields.githubusername = req.body.githubusername;
    // Skills - Spilt into array
    if (typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }
    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (profile) {
                //update
                Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
                    .then(profile => {
                        console.log('UPDATE PROFILE', profile);
                        res.json(profile)
                    })
            } else {
                //Create
                // Check if handle exits
                Profile.findOne({ handle: profileFields.handle })
                    .then(profile => {
                        if (profile) {
                            res.status(400).json("That handle already exists")
                        }
                        //save
                        new Profile(profileFields).save()
                            .then(profile => {
                                console.log('CREATE PROFILE', profile);
                                res.json(profile)
                            })
                    })
            }
        })
})


//@route POST /api/profile/experience
//@desc Add experience
//@access private
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    //Check Validation
    const { errors, isValid } = ValidateExperienceInput(req.body)

    if (!isValid) {
        console.log(errors)
        return res.status(400).json(errors)
    }
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
            console.log('profile', profile)
            profile.experience.unshift(newExp)
            profile.save().then(profile => res.json(profile))
        })
})


//@route POST /api/profile/education
//@desc Add education 
//@access private
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
    //Check Validation
    const { errors, isValid } = ValidateEducationInput(req.body)

    if (!isValid) {
        console.log(errors)
        return res.status(400).json(errors)
    }
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
            // console.log('profile', profile)
            profile.education.unshift(newEdu)
            profile.save().then(profile => res.json(profile))
        })
})


//@route DELETE /api/profile/experience/:exp_id
//@desc Delete experience
//@access private
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const removeIndex = profile.experience
                .map(item => item.id)
                .indexOf(req.params.exp_id)
            //Remove the experience
            profile.experience.splice(removeIndex, 1)

            //save the  profile
            profile.save().then(res.json(profile))
                .catch(err => res.status(404).json(err))
        })
})

//@route DELETE /api/profile/education/:edu_id
//@desc Delete education
//@access private
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const removeIndex = profile.education
                .map(item => item.id)
                .indexOf(req.params.edu_id)
            //Remove the experience
            profile.education.splice(removeIndex, 1)

            //save the  profile
            profile.save().then(res.json(profile))
                .catch(err => res.status(404).json(err))
        })
})


//@route DELETE /api/profile
//@desc Delete profile
//@access private
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
        .then(() => {
            User.findOneAndRemove({ _id: req.user.id })
                .then(() => res.json({ successs: true }))
        })
})

module.exports = router;
