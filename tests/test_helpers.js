const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const initialBlogs = [
    {
        title: "Test Blog",
        author: "Testboy",
        url: "www.testblog.com",
        user: "686646dcee02f3417c3a1139",
        likes: 4
    },
    {
        title: "Test Blog 2",
        author: "Testgirl",
        url: "www.testblog2.com",
        user: "686646dcee02f3417c3a1139",
        likes: 6
    }
]

const singleBlog = {
    title: "Test Blog 3",
    author: "Testperson",
    url: "www.testblog3.com",
    user: "686646dcee02f3417c3a1139",
    likes: 12
  }

const nonExistingId = async () => {
  const blog = new Blog({ 
    title: "WillRemoveThisSoon",
    author: "WillRemoveThisSoon",
    user: "686646dcee02f3417c3a1139",
    url: "WillRemoveThisSoon"
  })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const getFirstUserId = async () => {
  const users = await usersInDb()
  return users[0].id
}

const getUserToken = async (userId) => {
  const user = await User.findById(userId)

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(userForToken, process.env.SECRET)
  return token
}

module.exports = {
  initialBlogs, singleBlog, nonExistingId, blogsInDb, usersInDb, getFirstUserId, getUserToken
}