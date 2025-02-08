const express = require('express')
const router = express.Router()
const wrapAsync = require('../utils/wrapAsync.js')
const passport = require('passport')
const {saveRedirectUrl} = require('../middleware.js')

const userController = require('../controllers/user.js')

// *** Signup ***
router
    .route("/signup")
    .get(userController.renderSignUpForm)
    .post(wrapAsync(userController.signup))

// *** SignIn ***
router
    .route("/login")
    .get(userController.renderLogInForm)
    .post(saveRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),userController.login)

/* Logout */
// req.logout() uses serialize and deserialize
router.get("/logout",userController.logout)

module.exports = router