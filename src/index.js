const http = require('node:http')
const events = require('events')
const { randomUUID } = require('node:crypto')
const { route, responseTimeTrack } = require('./decorator')
const { setTimeout} = require('node:timers/promises')
const PORT = process.env.PORT || 3000

const DB = new Map()

class Server {
  @responseTimeTrack
  @route // must be first, because it changes the response data
  static async handler(req, res) {
    await setTimeout(parseInt(Math.random() * 100))

    if (req.method === 'POST') {
      const data = await events.once(req, 'data')
      const item = JSON.parse(data)
      item.id = randomUUID()

      DB.set(item.id, item)
      return { statusCode: 201, message: item }
      return
    }

    return { statusCode: 200, message: { message: [...DB.values()] } }
  }
}

const server = new Server()

http.createServer(Server.handler).listen(PORT, () => console.log(`Server is listening on port ${PORT}`))
