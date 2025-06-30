const Blog = require('../models/blog')

const initialBlogs = [
    {
        title: "Test Blog",
        author: "Testboy",
        url: "www.testblog.com",
        likes: 4
    },
    {
        title: "Test Blog 2",
        author: "Testgirl",
        url: "www.testblog2.com",
        likes: 6
    }
]

const nonExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}