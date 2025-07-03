const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (_request, response, next) => {
  try {
    const blogs = await Blog
                          .find({})
                          .populate('user', { username: 1, name: 1 })
    response.json(blogs)
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.post('/',  middleware.userExtractor, async (request, response, next) => {
  const body = request.body
  const user = request.user

  if (!user) {
    return response.status(400).json({ error: 'user missing or not valid' })
  }

  const nbLikes = body.likes ? body.likes : 0

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    user: user._id,
    likes: nbLikes
  })

  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.delete('/:id',  middleware.userExtractor, async (request, response, next) => {
  const user = request.user
  if (!user) {
    return response.status(400).json({ error: 'user missing or not valid' })
  }

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(400).json({ error: 'blog missing or not valid' })
  }

  if (blog.user.toString() === user.id.toString()) {
    try {
      await Blog.findByIdAndDelete(request.params.id)
      response.status(204).end()
    } catch (exception) {
      next(exception)
    }
  } else {
    return response.status(401).json({ error: 'user id does not match the post creator\'s id.'})
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const { title, author, url, likes } = request.body

  try {
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      return response.status(404).end()
    }

    blog.title = title
    blog.author = author
    blog.url = url
    blog.likes = likes

    const updatedBlog = await blog.save()
    response.json(updatedBlog)
  } catch (exception) {
    next(exception)
  }
})

module.exports = blogsRouter