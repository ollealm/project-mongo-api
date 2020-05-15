import mongoose from "mongoose";

const Book = mongoose.model('Book', {
  bookID: Number,
  title: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  // authors: String
  average_rating: Number,
  isbn: String,
  isbn13: String,
  num_pages: Number,
})

export default Book