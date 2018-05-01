
var path = require('path')
var mime = require('mime-types')
var isstream = require('isstream')


function generate (options) {
  var parts = []

  Object.keys(options.multipart).forEach(function (key) {
    var part = options.multipart[key]

    var body = part.value || part
    body = (body instanceof Array) ? body : [body]

    body.forEach(function (item) {
      if (isstream(item) && part.options && part.options.knownLength) {
        item._knownLength = part.options.knownLength
      }

      parts.push({
        'Content-Disposition': 'form-data; name="' + key + '"'
          + getContentDisposition(part),
        'Content-Type': getContentType(part),
        body: item
      })
    })
  })

  return parts
}

function getContentDisposition (part) {
  var body = part.value || part
    , options = part.options || {}

  var filename = ''

  if (options.filename) {
    filename = options.filename
  }

  // fs- and request- streams
  else if (body.path) {
    filename = body.path
  }

  // http response
  else if (body.readable && body.hasOwnProperty('httpVersion')) {
    filename = body.client._httpMessage.path
  }

  var contentDisposition = ''

  if (filename) {
    contentDisposition = '; filename="' + path.basename(filename) + '"'
  }

  return contentDisposition
}

function getContentType (part) {
  var body = part.value || part
    , options = part.options || {}

  var contentType = ''

  if (options.contentType) {
    contentType = options.contentType
  }

  // fs- and request- streams
  else if (body.path) {
    contentType = mime.lookup(body.path)
  }

  // http response
  else if (body.readable && body.hasOwnProperty('httpVersion')) {
    contentType = body.headers['content-type']
  }

  else if (options.filename) {
    contentType = mime.lookup(options.filename)
  }

  else if (typeof body === 'object') {
    contentType = 'application/octet-stream'
  }

  else if (typeof body === 'string') {
    contentType = 'text/plain'
  }

  return contentType
}

exports.generate = generate
