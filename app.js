if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

const express = require("express")
const app = express()
const mongoose = require('mongoose')
// const Listing = require('./models/listing.js')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require("ejs-mate")
// const wrapAsync = require('./utils/wrapAsync.js')
const ExpressErrors = require('./utils/ExpressErrors.js')
// const {listingSchema,reviewSchema} = require('./schema.js')
// const Review = require("./models/reviews.js")

const listingsRouter = require('./routers/listing.js')
const reviewsRouter = require('./routers/review.js')
const userRouter = require('./routers/user.js')

const session = require('express-session')
const flash = require('connect-flash')

const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user.js')
const MongoStore = require('connect-mongo')

const dbUrl = process.env.ATLASDB_URL;

main()
    .then(()=> console.log("Connection Successful"))
    .catch(err => console.log(err))

async function main(){
    await mongoose.connect(dbUrl)
}

app.set("view engine","ejs")
app.set("ejs",path.join(__dirname,"/views"))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname,"/public")))
app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    store: MongoStore.create({  // 14 days default to reset session info
        mongoUrl: process.env.ATLASDB_URL,
        collectionName: "sessions",
        crypto: {
            secret:process.env.SECRET,
        },
        touchAfter: 24 * 3600,
    }),
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true 
    }
}))
app.use(flash())

// midddlware to initialise passport
app.use(passport.initialize())
// web app must identity users as they browse from page to page.
app.use(passport.session())
/*

This is a method added to User model (usually by 
passport-local-mongoose plugin if using MongoDB/Mongoose). It does:

Checks if the username exists in the database

Verifies the password against the hashed password stored

Returns the user if valid, false if invalid

Earlier, you configured the LocalStrategy with:

passport.use(new LocalStrategy(User.authenticate()));
This is the critical connection!

When passport.authenticate("local") runs, it calls the LocalStrategy, 
which uses User.authenticate() internally to verify credentials.

*/
passport.use(new LocalStrategy(User.authenticate()))

// storing user info after user login for that session
passport.serializeUser(User.serializeUser())
// once user ends its session we remove the user info
passport.deserializeUser(User.deserializeUser())

app.engine("ejs",ejsMate)
/*
What Does app.engine Do?

--> The app.engine method in Express lets you register a custom template engine. 
It's how you tell Express, "Yo, when you see files with a specific extension 
(.ejs in this case), use this function (like ejs-mate) to render them."
*/

app.use((req,res,next)=>{
    res.locals.successMsg = req.flash('success')
    res.locals.errorMsg = req.flash('error')
    res.locals.currUser = req.user
    next()
})

// Demo user understanding
// app.get("/demouser",async (req,res)=>{
//     let fakeUser = new User({
//         email:"ak12@gmail.com",
//         username:"Atharva",
//     })
//     // internally uses pbkdf2 hashing algorithm.
//     let registeruser = await User.register(fakeUser,"Hello123")
//     res.send(registeruser)
// })

// *** Signup/SignIn Router ***
app.use("/",userRouter)

// *** Listing Router ***
app.use("/listing",listingsRouter)

// *** Reviews Router ***
app.use("/listing/:id/reviews",reviewsRouter)

// Not Found handler
/*
In Express.js, app.all() is a method used to define middleware that responds to all 
HTTP methods (like GET, POST, PUT, DELETE) for a "given route". 
It is not tied to a specific HTTP verb, unlike methods like app.get(), app.post(), etc.
*/

app.all("*",(req,res,next)=>{
    next(new ExpressErrors(404,"Page Not Found"))
})

app.use((err,req,res,next)=>{
    console.log(err.name)
    let {status=500,message="Something went wrong"} = err
    // res.status(status).send(message)
    res.status(status).render("error.ejs",{ message })
})

app.listen(8020,()=>{
    console.log("Listening at 8020...")
})