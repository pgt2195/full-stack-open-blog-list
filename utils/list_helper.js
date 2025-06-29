const dummy = (blogs) => {
  return 1
}

const totalLikes = blogs => blogs.reduce((sum, blog) => sum + blog.likes, 0)

const favoriteBlog = blogs => blogs.reduce((counter, blog) => blog.likes > counter.likes ? blog : counter, blogs[0])

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}