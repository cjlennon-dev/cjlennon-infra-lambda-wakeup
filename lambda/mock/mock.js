// mock out a call to the lambda function

// require mock event and mock context modules
let event = require('./event.json')
let MockContext = require('./mock-context.js')

let mockContext = new MockContext()
mockContext.saveToDisk = false

// the index is the main lambda index page (i.e. the function  the lambda will call in AWS)
let index = require('../index.js')

index.handler(event, mockContext)
