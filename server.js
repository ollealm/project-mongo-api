import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'

// If you're using one of our datasets, uncomment the appropriate import below
// to get started!
// 
// import goldenGlobesData from './data/golden-globes.json'
// import avocadoSalesData from './data/avocado-sales.json'
// import booksData from './data/books.json'
// import netflixData from './data/netflix-titles.json'
// import topMusicData from './data/top-music.json'

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


const Author = mongoose.model('Author', {
  name: String,
})

const Book = mongoose.model('Book', {
  title: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  }
})

if (process.env.RESET_DATABASE) {
  console.log('Database reset')
  const seedDatabase = async () => {
    await Author.deleteMany()
    await Book.deleteMany()

    const tolkien = new Author({ name: 'J.R.R Tolkien' })
    await tolkien.save()

    const rowling = new Author({ name: 'J.K. Rowling' })
    await rowling.save()

    await new Book({ title: 'Hobbit', author: tolkien }).save()
    await new Book({ title: 'Lord of the Rings', author: tolkien }).save()

    await new Book({ title: 'Harry', author: rowling }).save()
    await new Book({ title: 'Potter', author: rowling }).save()

  }
  seedDatabase()
}

// Animal.deleteMany().then(() => {

//   new Animal({ name: 'Olle', age: 36, isFurry: false }).save()
//   new Animal({ name: 'Olle2', age: 26, isFurry: true }).save()

// })

// Start defining your routes here
// app.get('/', (req, res) => {
//   Animal.find().then(animals => {
//     res.json(animals)
//   })
//   //res.send('Hello world')
// })


app.get('/authors', async (req, res) => {
  const authors = await Author.find()
  res.json(authors)
})

app.get('/authors/:id', async (req, res) => {
  const author = await Author.findById(req.params.id)
  res.json(author)
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
  const books = await Book.find().populate('author')
  res.json(books)
})



// Animal.findOne({ name: req.params.name }).then(animal => {
//   if (animal) {
//     res.json(animal)
//   } else {
//     res.status(404).json({ error: 'Not found' })
//   }
// })


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
