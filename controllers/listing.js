const { response } = require('express')
const Listing = require('../models/listing.js')

module.exports.index = async (req,res)=>{
    let allListings = await Listing.find()
    res.render("listing/index.ejs",{allListings})
}

module.exports.RenderListingForm = (req,res)=>{
    console.log(req.user)
    res.render("listing/new.ejs")
}

module.exports.createNewListing = async (req,res)=>{

    let url = req.file.path
    let filename = req.file.filename
    // console.log(url+" ...."+filename)

    const newListing = new Listing(req.body.listing)
    newListing.owner = req.user._id
    newListing.image.url = url
    newListing.image.filename = filename

    // But we Can't Define if() for every Field
    // if(!newListing.country){
    //     throw new ExpressErrors(400,"Country is not mentioned")
    // }

    
    let location = newListing.location
    let country = newListing.country

    let address = `${location}, ${country}`

    // *** Geocoder ***
    async function getCoordinates(address){
        try {
            
            const query = encodeURIComponent(address)
    
            let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
            const data = await response.json()
    
            if(data && data.length){
                const {lat,lon} = data[0]
                return {lat,lon}
            }else{
                return {lat:null,lon:null}  
            }
        } catch (error) {
            // console.log("Error fetching coordinates:", error)
            return {lat:null,lon:null}
        }
    }

    const coordinate = await getCoordinates(address)
    newListing.geometry.type = 'Point'
    newListing.geometry.coordinates = [coordinate.lon,coordinate.lat]

    await newListing.save()
    req.flash('success','New Listing Added')
    res.redirect("/listing")
}

module.exports.RenderEditForm = async(req,res)=>{
    const {id} = req.params
    const listing = await Listing.findById(id)

    if(!listing){
        req.flash("error","Listing you requested doesn't exist")
        res.redirect("/listing")
    }

    let originalImageUrl = listing.image.url
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250")

    res.render("listing/edit.ejs",{listing,originalImageUrl})
}

module.exports.UpdateListing = async (req,res)=>{
    const {id} = req.params
    const listing = await Listing.findByIdAndUpdate(id,{...req.body.listing})

    if(typeof req.file !== "undefined"){
        let url = req.file.path
        let filename = req.file.filename

        listing.image = {url,filename}
        await listing.save()
    }

    req.flash("success","Listing Updated")
    res.redirect(`/listing/${id}`)
} 

module.exports.DeleteListing = async (req,res)=>{
    let {id} = req.params
    await Listing.findByIdAndDelete(id)
    req.flash("success","Listing Deleted")
    res.redirect("/listing")
} 

module.exports.ShowListing = async (req,res)=>{
    let {id} = req.params
    const listing = await Listing.findById(id).
                            populate({path:"reviews",
                                populate:"author"    
                            }).
                            populate("owner")
    
    if(!listing){
        req.flash("error","Listing you requested doesn't exist")
        return res.redirect("/listing")
    }

    let location = listing.location
    let country = listing.country

    let address = `${location}, ${country}`

    // *** Geocoder ***
    async function getCoordinates(address){
        try {
            
            const query = encodeURIComponent(address)
    
            let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
            const data = await response.json()
    
            if(data && data.length){
                const {lat,lon} = data[0]
                return {lat,lon}
            }else{
                return {lat:null,lon:null}  
            }
        } catch (error) {
            // console.log("Error fetching coordinates:", error)
            return {lat:null,lon:null}
        }
    }

    const coordinates = await getCoordinates(address)

    res.render("listing/show.ejs",{listing,coordinates})
}

// Filter
module.exports.FilterListings = async(req,res)=>{
    let req_category = req.params.category.replace("-"," ")
    
    let listings = await Listing.find({category:req_category})

    if(listings.length == 0){
        req.flash('error',`No Listings Available for Category: ${req_category}`)
        return res.redirect("/listing")
    }

    res.render("listing/filter.ejs",{listings,req_category})
}

module.exports.SearchListings = async(req,res)=>{
    let searchQuery = req.query.search
    
    let allListings = await Listing.find({
        $or:[
            {title:{ $regex:searchQuery, $options: "i"  }},
            {location:{ $regex:searchQuery, $options: "i" }},
            {country:{ $regex:searchQuery, $options: "i" }},
        ]
    })

    if(allListings.length == 0 || !allListings){
        req.flash("error",`No Listing avaliable for : ${searchQuery}`)
        return res.redirect("/listing")
    }

    res.render("listing/index.ejs",{allListings})
}