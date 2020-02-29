
var stream = require('stream')

var bl = require('bl')
var isstream = require('isstream')
var multistream = require('multistream')

var formdata = require('./formdata')


module.exports = (options, boundary) => {
  var body = []
  var multipart = options instanceof Array ? options : formdata(options)

  // if (options.preambleCRLF) {
  //   body.append('\r\n')
  // }

  multipart.forEach((part) => {
    var preamble = `--${boundary}\r\n`

    var headers = Object.keys(part)
      .filter((key) => key !== 'body')
      .map((key) => `${key}: ${part[key]}`)
      .join('\r\n')

    body.push(bl(preamble + headers + '\r\n\r\n'))
    body.push(isstream(part.body) ? part.body : bl(part.body))
    body.push(bl('\r\n'))
  })
  body.push(bl(`--${boundary}--`))

  // if (options.postambleCRLF) {
  //   body.append('\r\n')
  // }

  var stream = new multistream(body)
  stream._items = body // content-length

  return stream
}
