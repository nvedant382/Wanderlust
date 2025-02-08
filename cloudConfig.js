let cloudinary = require('cloudinary').v2
let {CloudinaryStorage} = require('multer-storage-cloudinary')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder: "wanderlust_DEV",
        allowedFormats: ["jpeg","jpg","png"]
    }
})

module.exports = {
    cloudinary,
    storage
}