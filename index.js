const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

const PORT = config.PORT
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`)
})