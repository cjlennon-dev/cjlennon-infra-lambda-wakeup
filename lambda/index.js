'use strict'

// require core modules
let path = require('path')
let fs = require('fs')

// require installed modules
let AWS = require('aws-sdk')
let co = require('co')

// require local modules
let errorHelper = require('./lib/error-helper')

// initialize
// load .env file, if present
require('dotenv').config({ path: path.join(__dirname, '.env') })

// if a local AWS config file is present, use this as credentials (dev only, not needed within AWS)
let configFile = path.join(__dirname, 'aws.config.json')
if (fs.existsSync(configFile)) {
  AWS.config.loadFromPath(configFile)
  console.log(path.basename(module.filename) + ' is using AWS credentials supplied in aws.config.json.  Region is ' + AWS.config.region)
}

let awsLambda = new AWS.Lambda()

// lambda function entry point
exports.handler = (event, context, callback) => {
  co(function * () {
    try {
      let lambdas = process.env.LAMBDA_FUNCTIONS

      if (!lambdas) {
        return context.fail('There are no lambdas to wake up.  Define the lambda functions you want to wake up as an array in an environment variable named LAMBDA_FUNCTIONS')
      }

      lambdas = JSON.parse(lambdas)

            // invoke the lamdas...
      let functionArray = []
      for (let i = 0; i < lambdas.length; i++) {
        functionArray.push(wakeUpLambda(lambdas[i]))
      }

            // ... in parallel
      yield functionArray

      context.succeed('all Lambda functions have been woken up')
    } catch (err) {
      errorHelper.logError(event, err.Message, 'all lambdas were not woken up', err)

      context.fail(err)
    }
  })
}

function wakeUpLambda (lambdaFunction) {
  return new Promise(function (resolve, reject) {
    let forceInitialize = false
    if (process.env.FORCE_INITIALIZE) {
      forceInitialize = true
    }

    let payload = {
      'wakeUp': true,
      'forceInitialize': forceInitialize
    }

    let params = {
      FunctionName: lambdaFunction,
      Payload: JSON.stringify(payload)
    }

    awsLambda.invoke(params, function (err, data) {
      if (err) {
        console.log('error waking up ' + err)
        reject(err)
      } else {
        console.log('woke up ' + lambdaFunction + ' response: ' + JSON.stringify(data))
        resolve(data)
      }
    })
  })
}
