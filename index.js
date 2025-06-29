const express = require('express')
const mongoose = require('mongoose')

const config = require('./utils/config')

const app = express()

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
})

const Blog = mongoose.model('Blog', blogSchema)

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl)

app.use(express.json())

// Pour tester si tout fonctionne :
app.get('/', (req, res) => {
  res.send('Hello from Node!')
})

app.get('/api/blogs', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog.save().then((result) => {
    response.status(201).json(result)
  })
})

//TODO : empêcher de renvoyer le champ __v lors des responses
//       et faire en sorte d'enlever le _ au début du champ 'id'.

const PORT = config.PORT
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})