const lodash = require('lodash')

const dummy = blogs => 1

const totalLikes = blogs => blogs.reduce((sum, blog) => sum + blog.likes, 0)

const favoriteBlog = blogs => blogs.reduce((counter, blog) => blog.likes > counter.likes ? blog : counter, blogs[0])

const mostBlogs = blogs => {
  const groupByAuthor = lodash.groupBy(blogs, 'author')
  const getCountByAuthor = lodash.map(groupByAuthor, (blogs, author) => {
    return {
      author: author,
      blogs: blogs.length
    }
  })
  return lodash.maxBy(getCountByAuthor, 'blogs')
}

const mostLikes = blogs => {
  const groupByAuthor = lodash.groupBy(blogs, 'author')
  const getCountByAuthor = lodash.map(groupByAuthor, (blogs, author) => {
    return {
      author: author,
      likes: totalLikes(blogs)
    }
  })
  return lodash.maxBy(getCountByAuthor, 'likes')
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}