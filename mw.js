
var lib = require('./lib/multipart')


module.exports = (multipart) => ({options, options: {headers}}) => {

  var encoding = Object.keys(headers)
    .find((name) => name.toLowerCase() === 'transfer-encoding')

  if (!encoding) {
    headers['transfer-encoding'] = 'chunked'
  }

  var content = Object.keys(headers)
    .find((name) => name.toLowerCase() === 'content-type')

  var contentType
  if (content) {
    contentType = headers[content]
  }

  var {contentType, body} = lib({multipart, contentType})
  headers['content-type'] = contentType

  return {options, body}

}
