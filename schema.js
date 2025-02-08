const Joi = require('joi')

/*
Joi is a powerful data validation library for JavaScript and Node.js. 
It's here to save your sanity when it comes to validating user input or data schemas. 
Instead of writing a thousand if statements to validate stuff, 
Joi lets you define rules in a clean and structured way.
*/

// Server Side Validation Schema

const listingSchema = Joi.object({
    listing : Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        image:Joi.string().allow("",null),
        price:Joi.number().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        category:Joi.string().required()
    }).required()
})

const reviewSchema = Joi.object({
  review : Joi.object({
    rating:Joi.number().required().min(1).max(5),
    comment:Joi.string().required(),
  }).required()
})

module.exports ={ 
  listingSchema,
  reviewSchema,
}

// if u do module.exports.listingSchema then import as {listingSchema}
// cause module.exports itself is object

/*
Outer Joi.object(): Represents the entire schema for your input data. 
This means the top-level object you're validating.

Inner Joi.object(): Represents the nested listing object inside your data.

Because actual data is :
{
  "listing": {
    "title": "Awesome Apartment",
    "description": "A lovely place to stay",
    "price": 1200,
    "location": "Mumbai",
    "country": "India"
  }
}
*/