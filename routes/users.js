const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');

// Register
router.post('/register', (req, res, next) => {
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        todos: [],
    });

    User.addUser(newUser, (err, user) => {
        if(err) {
            res.json({success: false, msg:"Failed to register user " + err});
        } else {
            res.json({success: true, msg:"User registered"});
        }
    });
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({success: false, msg: 'User not found'});
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign({data: user}, config.secret, { 
                    expiresIn: 604800 // 1 week
                });

                res.json({
                    success: true,
                    token: 'JWT ' +token,
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    }
                })
            } else {
                return res.json({success: false, msg: 'Wrong password'});
            }
        });
    });
});

// Profile
router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    res.json({user: req.user});
});

// Update user tasks
router.put('/:id/tasks', (req, res, next) => {
    const userId = req.params.id;
    const tasks = req.body;

    User.findByIdAndUpdate(
        userId,
        { $set: { todos: tasks } },
        { new: true },
        (err, user) => {
            if (err) {
            return res.json({ success: false, msg: 'Failed to update tasks' });
            }
            return res.json({ success: true, msg: 'Tasks updated successfully', user });
      });
})

// Get user data (todo list)
router.get('/:id/tasks', (req, res, next) => {
    const userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, msg: 'Failed to get user tasks' });
          }
          if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }
        const tasks = user.todos.map(task => task.description);
        return res.status(200).json({ success: true, tasks });
    });
})

module.exports = router;