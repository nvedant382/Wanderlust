const Listing = require("./models/listing.js")
const Review = require("./models/reviews.js")

module.exports.isLoggedIn = (req,res,next)=>{
    // console.log(req.user)
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash('error','You Must be Logged In for this')
        return res.redirect("/login")
    }
    next()
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next()
}

module.exports.isOwner = async (req,res,next)=>{
    let {id} = req.params
    // await Listing.findByIdAndUpdate(id,{...req.body.listing})
    let listing = await Listing.findById(id)

    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash('error',"You don't have persmission to edit")
        return res.redirect(`/listing/${id}`)
    }
    next()
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id,reviewId} = req.params

    let review = await Review.findById(reviewId)

    if(!review.author.equals(res.locals.currUser._id)){
        req.flash('error','You are not author of this review.')
        return res.redirect(`/listing/${id}`)
    }
    next()
}