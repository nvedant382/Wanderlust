const express = require("express")
const router = express.Router({mergeParams:true})

const wrapAsync = require('../utils/wrapAsync.js')
const ExpressErrors = require('../utils/ExpressErrors.js')
const {reviewSchema} = require('../schema.js')
const { isLoggedIn,isReviewAuthor } = require("../middleware.js")

const reviewController = require('../controllers/reviews.js')

const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body)

    // 400 - Bad request
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",")
        throw new ExpressErrors(400,errMsg)
    }else{
        next() // find actual route
    }
}

// POST Review
// For Posting review user must be logged in
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview))

// DELETE Review
// Now this is case when we delete a particular review from listing
// But if we delete entire listing then all reviews of that listing will be deleted
// we will define a post middleware when users deletes entire listing

router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.deleteReview))

module.exports = router