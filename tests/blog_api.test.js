const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helpers')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const lodash = require('lodash')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('unique identifier property is named "id"', async () => {
  const response = await api.get('/api/blogs')

  assert(response.body.every(el => el.id))
})

test('a valid blog can be added', async () => {
  const newBlog = helper.singleBlog
  const user = await helper.getFirstUserId()
  newBlog.user = user

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const withoutId = blogsAtEnd.map(({ id, user, ...otherFields }) => {
    return { ...otherFields, user: user.toString() } // Need to convert the user id to a string so the comparaison above passes
  })
  assert(withoutId.some(blog => lodash.isEqual(blog, newBlog)))
})

test('a valid blog added without likes property is default to 0 like', async () => {
  const { likes, ...newBlogWithoutLikes} = helper.singleBlog
  newBlogWithoutLikes.user = await helper.getFirstUserId()

  const response = await api
    .post('/api/blogs')
    .send(newBlogWithoutLikes)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('an invalid blog without title property can\'t be added', async () => {
  const { title, ...badBlog} = helper.singleBlog

  await api
    .post('/api/blogs')
    .send(badBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('an invalid blog without url property can\'t be added', async () => {
  const { url, ...badBlog} = helper.singleBlog

  await api
    .post('/api/blogs')
    .send(badBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('deletion succeeds with status code 204 if id is valid', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  assert(!blogsAtEnd.some(blog => blog.id === blogToDelete.id))
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})

test('deletion fails with status 400 if id nor properly formated', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const fakeId = 1234567

  await api
    .delete(`/api/blogs/${fakeId}`)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
})

test('updating the likes count of an existing entry', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const { id, ...updatedBlog } = blogsAtStart[0]
  updatedBlog.likes = 1000
  
  const response = await api
    .put(`/api/blogs/${id}`)
    .send(updatedBlog)
    .expect(200)

  assert.strictEqual(response.body.likes, 1000)
})

test('updating fails with status 404 if id doesn\'t exists', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const fakeId = await helper.nonExistingId()
  const { id, ...updatedBlog } = blogsAtStart[0]

  await api
    .put(`/api/blogs/${fakeId}`)
    .send(updatedBlog)
    .expect(404)

  const blogsAtEnd = await helper.blogsInDb()
  assert.deepStrictEqual(blogsAtEnd[0], blogsAtStart[0])
})

test('updating fails if likes is not the good data type', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const { id, ...updatedBlog } = blogsAtStart[0]
  updatedBlog.likes = 'one thousand'
  
  const response = await api
    .put(`/api/blogs/${id}`)
    .send(updatedBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  assert.deepStrictEqual(blogsAtEnd[0], blogsAtStart[0])
})

after(async () => {
  await mongoose.connection.close()
})