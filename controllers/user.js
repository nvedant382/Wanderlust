const User = require('../models/user.js')

module.exports.renderSignUpForm = (req,res)=>{
    res.render("users/signup.ejs")
}

module.exports.signup = async (req,res)=>{
    try{
        let {username,email,password} = req.body
        const newUser = new User({username,email})
        let registeredUser = await User.register(newUser,password);
        // console.log(registeredUser)

        // assigns user to req.user
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err)
            }
            req.flash("success",`Welcome to Wanderlust,${username}`)
            res.redirect("/listing")
        }) 
    }catch(e){
        req.flash('error',e.message)
        res.redirect("/signup")
    }
} 

module.exports.renderLogInForm = (req,res)=>{
    res.render("users/login.ejs")
}

module.exports.login = async (req,res)=>{
    // passport refreshes entire req.session
    req.flash('success','Welcome back to Wanderlust')

    let redirectUrl = res.locals.redirectUrl || "/listing"
    res.redirect(redirectUrl)
}

module.exports.logout = (req,res,next)=>{
    // logout removes user from req.user
    req.logout((err)=>{
        if(err){
            return next(err) // if passport.js fails
        }
        req.flash('success','You are Logged out')
        res.redirect("/listing")
    })
}