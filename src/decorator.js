const { randomUUID } = require('node:crypto')

let ui

const isUiDisabled = process.env.Ui_Disabled

if (isUiDisabled) {
  ui = { renderGraph: () => {}, updateGraph: () => {}}
} else {
  const { Ui } = require('./ui')
  ui = new Ui()
}
const log = function (...args) {
  if (isUiDisabled) console.log(...args)
}
exports.route = function (target, properties) {
  const { kind, name } = properties
  console.log({ target, properties })
  if (kind !== 'method') return target

  const thisValue = this
  console.log('this', thisValue )
  return async function (req, res) {
    // This means, first handler method will execute and returns the object from method
    const { statusCode, message } = await target.apply(thisValue, [req, res])
    res.writeHead(statusCode)
    res.end(JSON.stringify(message))
  }
  return target
}

exports.responseTimeTrack = function (target, { kind, name }) {
  console.log({ target, kind, name })
  if (kind !== 'method') return target

  ui.renderGraph()

  return async function (req, res) {
    const reqId = randomUUID()
    const reqStartedAt = performance.now()
    const methodsTimeTracker = {
      GET: performance.now(),
      POST: performance.now()
    }
    // console.time('benchmark')
    // This means, first handler method will execute and returns the object from method
    const afterExec = target.apply(this, [req, res])
    const data = { reqId, name, method: req.method, url: req.url }

    const onFinally = onRequestEnd({ data, res, reqStartedAt, methodsTimeTracker })

    // Assuming it will always be a promise object
    afterExec.finally(onFinally)
    return afterExec
  }
}

function onRequestEnd({ data, res, reqStartedAt, methodsTimeTracker }) {
  return () => {
    const requestEndAt = performance.now()
    let timeDiff = requestEndAt - reqStartedAt
    let seconds = Math.round(timeDiff)

    data.statusCode = res.statusCode
    data.statusMessage = res.statusMessage
    data.elapsed = timeDiff.toFixed(2).concat('ms')
    log('benchmark', data)
    // simulate that we already made some calculations or spawned the process in another one
    const trackerDiff = requestEndAt - methodsTimeTracker[data.method]
    // ui.updateGraph(data.method, seconds)
    if (trackerDiff >= 30) {
    // 20ms then we will update to graph, to not block the event loop
      ui.updateGraph(data.method, seconds)

      methodsTimeTracker[data.method] = performance.now()
    }
  }
}
