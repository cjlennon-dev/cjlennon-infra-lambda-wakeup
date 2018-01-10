// require node core modules
let fs = require('fs')
let path = require('path')

class mockContext {
  constructor () {
    this._saveToDisk = true
  }

  set saveToDisk (saveToDisk) {
    this._saveToDisk = saveToDisk
  }
  get saveToDisk () {
    return this._saveToDisk
  }

  succeed (response) {
    console.log('[Mock Response] ' + JSON.stringify(response))

    if (this._saveToDisk) {
      let filePath = path.join(__dirname, 'mocked-page.html')
      fs.writeFileSync(filePath, response.body)
      console.log('==============================================================================================================')
      console.log('Mock response saved to ' + filePath)
      console.log('==============================================================================================================')
    }
  }

  fail (response) {
    console.log('[Mock Response (***FAIL***)] ' + JSON.stringify(response))
  }
}

module.exports = mockContext
