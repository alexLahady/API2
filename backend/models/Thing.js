const mongoose = require('mongoose');

const thingSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: {type : String, required: true},
  mainPepper: {type: String, required: true},
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: {type: Number, required: false},
  dislike : {type : Number, required: false},
  userLiked : {type : String, required: false},
  userdisliked : {type :String, required: false}
});

module.exports = mongoose.model('Thing', thingSchema)