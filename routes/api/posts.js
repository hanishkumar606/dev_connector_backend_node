const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const passport = require('passport')

//Post Model
const Post = require('../../models/Post')
//Profile Model
const Profile = require('../../models/Profile')

//Post Validation
const ValidatePostInput = require('../../validation/post')

//@route GET /api/posts/test
//@desc Test posts route
//@access public
router.get('/test', (req, res) => res.json({ msg: "Posts module work" }));


//@route POST /api/posts
//@desc Create Posts
//@access private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = ValidatePostInput(req.body)

    if (!isValid) {
        return res.status(400).json(errors)
    }
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    })

    newPost.save().then((post) => res.json(post))
})



//@route GET /api/posts
//@desc GET all Posts
//@access public
router.get('/', (req, res) => {

    Post.find().sort({ date: -1 })
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({ noPostsFound: "No Posts Found" }))
})



//@route GET /api/posts/:id
//@desc GET Post by id 
//@access public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({ noPostFound: "No post found with this id" }))
})



//@route DELETE /api/posts/:id
//@desc Delete Post by id 
//@access private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    //check for post owner
                    // console.log("POst req", post.user, req.user)
                    if (post.user.toString() !== req.user.id) {
                        return res.status(401).json({ notAuthorized: "User not authorized" })
                    }
                    //delete
                    post.remove().then(() => res.json({ success: true }))

                })
                .catch(err => res.status(404).json({ noPostFound: "No post found" }))
        })
})




//@route POST /api/posts/like/:id
//@desc Add like
//@access private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    //Check if already liked
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        return res.status(400).json({ alreadyLiked: "User already liked the post" })
                    }
                    //Add like to the array
                    post.likes.unshift({ user: req.user.id })

                    post.save().then(post => res.json(post))
                })
                .catch(err => res.status(404).json({ noPostFound: "No post found" }))
        })
})



//@route POST /api/posts/unlike/:id
//@desc Remove like
//@access private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    //Check if already liked
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        return res.status(400).json({ notLiked: "You have not yet liked this post" })
                    }
                    //Get remove index
                    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)

                    //Remove like 
                    post.likes.splice(removeIndex, 1)

                    post.save().then(post => res.json(post))
                })
                .catch(err => res.status(404).json({ noPostFound: "No post found" }))
        })
})



//@route POST /api/posts/comment/:id
//@desc Add comment
//@access private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = ValidatePostInput(req.body)

    if (!isValid) {
        return res.status(400).json(errors)
    }

    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            }

            //Add comment
            post.comments.unshift(newComment)

            //save
            post.save().then(post => res.json(post))
        })
        .catch(err => res.status(404).json({ noPostFound: "No post found" }))
})




//@route DELETE /api/posts/comment/:id/:comment_id
//@desc Add comment
//@access private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Post.findById(req.params.id)
        .then(post => {

            //check if comment exits
            if (
                post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0
            ) {
                return res._construct.status(404).json({ commentnotexists: "Comment does not exist" })
            }
            //Get remove index
            const removeIndex = post.comments
                .map(item => item._id.toString())
                .indexOf(req.params.comment_id)


            // Remove comment
            post.comments.splice(removeIndex, 1)

            //Save
            post.save().then(post => res.json(post))
        })

        .catch(err => res.status(404).json({ noPostFound: "No post found" }))
})


module.exports = router;