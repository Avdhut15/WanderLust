const Joi = require('joi');

const listingCategories = [
    "Trending", "Rooms", "Iconic Cities", "Mountains", "Castles",
    "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Boats",
];

module.exports.listingSchema = Joi.object({
    _csrf: Joi.string().required(),
    listing : Joi.object({
        title: Joi.string().trim().min(2).max(120).required(),
        description: Joi.string().trim().min(10).max(2000).required(),
        location: Joi.string().trim().min(2).max(120).required(),
        country: Joi.string().trim().min(2).max(80).required(),
        category: Joi.string().valid(...listingCategories).allow(""),
        price: Joi.number().required().min(0).max(100000000),
        image: Joi.object({
            url: Joi.string().uri({ scheme: ["http", "https"] }).allow("", null)
        }).allow(null)
    }).required()
})

module.exports.reviewSchema = Joi.object({
    _csrf: Joi.string().required(),
    review: Joi.object({
        comment: Joi.string().trim().required(),
        rating: Joi.number().integer().min(1).max(5).required()
    }).required()
});
