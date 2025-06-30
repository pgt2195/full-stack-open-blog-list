const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helpers')
const Blog = require('../models/blog')
const lodash = require('lodash')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('unique identifier property is named "id"', async () => {
  const response = await api.get('/api/blogs')

  assert(response.body.every(el => el.id))
})

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: "Test Blog 3",
    author: "Testperson",
    url: "www.testblog3.com",
    likes: 12
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const withoutId = blogsAtEnd.map(({ id, ...otherFields }) => otherFields)
  assert(withoutId.some(blog => lodash.isEqual(blog, newBlog)))
})

after(async () => {
  await mongoose.connection.close()
})