const express = require("express")
const router = express.Router()

const wrapAsync = require('../utils/wrapAsync.js')
const ExpressErrors = require('../utils/ExpressErrors.js')
const {listingSchema} = require('../schema.js')
const {isLoggedIn,isOwner} = require('../middleware.js')

const listingController = require('../controllers/listing.js')

const multer = require('multer')
const {storage} = require('../cloudConfig.js')
const upload = multer({storage})

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body)

    if(error){
        throw new ExpressErrors(400,error)
    }else{
        next()
    }
}

// "/" route
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createNewListing))    
    // upload.single() will add info req.file and process/parse image at backend

// FILTERING
router.get("/filter/:category",wrapAsync(listingController.FilterListings))

// SEARCHING
router.get("/find",wrapAsync(listingController.SearchListings))

// POST /listing
router.get("/new",isLoggedIn,listingController.RenderListingForm)

// "/:id" route
router
    .route("/:id")
    .get(wrapAsync(listingController.ShowListing))
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.DeleteListing))
    .put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.UpdateListing))

// UPDATE listing/:id/edit
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.RenderEditForm))

module.exports = router