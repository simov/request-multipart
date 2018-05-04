
var BulkStream = require('bulk-stream')
var formdata = require('./formdata')


module.exports = (options, boundary) => {
  var body = new BulkStream()
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

    body.append(preamble + headers + '\r\n\r\n')
    body.append(part.body)
    body.append('\r\n')
  })
  body.append(`--${boundary}--`)

  // if (options.postambleCRLF) {
  //   body.append('\r\n')
  // }

  return body
}
