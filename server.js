import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import Book from './models/books'
import Author from './models/authors'

import booksData from './data/books.json'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/books"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())


if (process.env.RESET_DB) {
  console.log('Database reset')
  const seedDatabase = async () => {
    await Author.deleteMany({})
    await Book.deleteMany({})

    // creating array with unique Authors from data
    const uniqueAuthors = [... new Set(booksData.map(book => book.authors))]

    await uniqueAuthors.forEach(async (authorName) => {

      // Creating an author for each unique author
      const author = await new Author({ name: authorName }).save()

      // Creating a book for each of the authors books and assingnig the author 
      await booksData.filter(book => book.authors === author.name).forEach(async (book) => {
        await new Book({
          title: book.title,
          author: author
        }).save()
      })
    })
  }
  seedDatabase()
}



app.get('/authors', async (req, res) => {
  // const authors = await Author.find({ name: "Douglas Adams" })
  const authors = await Author.find()
  res.json(authors)
})

app.get('/authors/:id', async (req, res) => {
  const author = await Author.findById(req.params.id)
  if (author) {
    res.json(author)
  } else {
    res.status(404).json({ error: "Author not found" })
  }
})


app.get('/authors/:id/books', async (req, res) => {
  const author = await Author.findById(req.params.id)
  if (author) {
    const books = await Book.find({ author: mongoose.Types.ObjectId(author.id) })
    res.json(books)
  } else {
    res.status(404).json({ error: "Author not found" })
  }
})

app.get('/books', async (req, res) => {
  const { title } = req.query
  const titleRegex = new RegExp(`\\b${title}\\b`, 'i')

  if (title) {
    const books = await Book.find({ title: titleRegex }).sort({
      avarage_rating: -1,
    })
    res.json(books)

  } else {
    const books = await Book.find().populate('author')
    res.json(books)
  }

})


app.get('/books', async (req, res) => {

  res.json(books)
})



// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
