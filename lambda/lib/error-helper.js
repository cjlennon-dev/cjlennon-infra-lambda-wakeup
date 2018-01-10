'use strict'

// require node core modules
let fs = require('fs')
let path = require('path')

// module variables
let html500

// public interface
exports.logError = logError
exports.logErrorAndReturn500Html = logErrorAndReturn500Html

// private methods

function logError (event, message, impact, error) {
  let _error = {}

  _error.tag = 'cjlennon-cognify-error'
  if (impact) { _error.impact = impact }
  if (message) { _error.message = message }
  _error.id = generateErrorId()

  if (error) {
    _error.errorMessage = error.message
    _error.stack = error.stack
  }

  if (event) { _error.lambdaEvent = event }

  console.error(_error)

  return _error.id
}

function logErrorAndReturn500Html (event, message, impact, error) {
  let _error = {}

  _error.tag = 'cjlennon-cognify-error'
  if (impact) { _error.impact = impact }
  if (message) { _error.message = message }
  _error.id = generateErrorId()

  if (error) {
    _error.errorMessage = error.message
    _error.stack = error.stack
  }

  if (event) { _error.lambdaEvent = event }

  console.error(_error)

  if (!html500) {
    let filePath = path.join(__dirname, 'error-helper-500.html')
    html500 = fs.readFileSync(filePath).toString()
  }

  html500 = html500.replace('[errorId]', _error.id)

  return html500
}

// generate a semi-unique error Id, based on the date.
// format is YY-DDMM-HHmm-SSSS
// it is only semi-unique in that potentially two errors could occur in the exact same milisecond
function generateErrorId () {
  let d = new Date()
  let day = '' + d.getDate()
  let month = '' + d.getMonth()
  let year = d.getFullYear()
  let hour = '' + d.getHours()
  let minute = '' + d.getMinutes()
  let ms = d.getMilliseconds()

  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day
  if (hour.length < 2) hour = '0' + hour
  if (minute.length < 2) minute = '0' + minute

  let time = '' + hour + minute

  let errorId = `${year}-${month}-${day}-${time}-${ms}`

  return errorId
}
