# cjlennon-infra-lambda-wakeup

## Introduction

AWS Lambda functions run within containers and once invoked the function stays 'warm' for a variable and unspcified period of time (approx. 40 minutes seems to be a rough estimate).  After this time the container is torn down and a further call to the function will take some time before the container is spun up and the function can begin executing

This 'cold start' time is also variable, but it is significant enough to be well documented on the internet. In addition if your lambda is part of a VPC then start up time increases significantly (it can be up to 10 seconds).  For many use cases this will not matter but in some cases you may wish to keep your Lambdas warm to improve your user experience.  

For a detailed analysis of Lambda cold start times see [this link](https://www.robertvojta.com/aws-journey-api-gateway-lambda-vpc-performance/)

## Component overview

Wakes up (i.e. calls `invoke` on) the lamba functions that you specify in an array within an environment variable

### Technical Components

- AWS Lambda function (nodejs 6)
- AWS CloudWatch Events trigger (optional)

## Set up

1.  Clone this repo :)

### Set up on AWS

2.  Create a new lambda function in AWS and deploy the contents of the `lambda` directory

    - To manually deploy this Lambda function, zip up the contents of this repo's `lambda`  folder, and upload the zip file to the AWS lambda function e.g. using the AWS Console

    - If you are using AWS Codebuild then configure the Codebuild build project to use the `buildspec.yaml` file which is cotained in the root repository folder.  AWS Codebuild will use this file to generate a zip deployment package and upload this to AWS S3

3.  Set environment variables.  The lamdas you wish to invoke should be contained as a comma separated array within an environment variable named `LAMBDA_FUNCTIONS`. For example

    ````
    ["LambdaToWakeUp","AnotherLambda","YetAnotherLambda"]
    ````

4.  Permissions.  Your Lambda function will need `Invoke` permissions on Lambda functions.   Use the `AWSLambdaFullAccess` policy, or create your own with a policy such as:

    ````json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "InvokePermission",
                "Effect": "Allow",
                "Action": [
                    "lambda:InvokeFunction"
                ],
                "Resource": "*"
            }
        ]
    }

    ````

    Note that the AWS managed policy `AWSLambdaExecute` does _not_ give the necessary permissions. 

5.  At this point you will be able to run your Lambda and see the results displayed when the function finishes

    Note that any functions you call in this way will simply behave as they would when an event with the payload `{"wakeUp":true}` is passed in.  You may wish to modify the functions you wish to keep warm to specifically handle this event.  In addition you can optionally create a `FORCE_INITIALIZE` environment variable, which will pass event json as
    ````json
    {"wakeUp":true,"forceInitialize":true}
    ````

5.  Optional.  Create an AWS CloudWatch Event to regularly call this lambda function.  This is done as per standard AWS functionality. To do this within the AWS Console:
-  Navigate to AWS Cloud Watch, click 'Events' and choose to 'Create Rule'
-  Choose the schedule you wish e.g. every 20 minutes and as your Target specify the lambda function you have created in Step 2.

### Local development install

If you wish to run this function on your local environment then follow the below steps:

1.  Install the necessary npm libraries.  From the command window navigate to this repos `Lambda` folder and run `npm install`

2.  You will need a valid AWS IAM user with the necessary permissions.  Create a new file named `aws.config.json` and place this in the root of the `\lambda`  folder.  This file should have the following format

    ````
    { "accessKeyId": "Your AWS access key",
    "secretAccessKey": "Secret",
    "region": "your region" }
    ````

    The IAM user you specify with your access key should have permissions to invoke Lambda functions (see step 4 of the 'Deploy to AWS' instructions above)

3.  Set environment variables.  Environment variables need to be set as per step 3 of the 'Deploy to AWS' instructions above.  This repo includes the `dotenv` npm module so to set these variables you can:

    -  create a new file named `.env` in the root of the `Lambda` directory
    -  add text to this file in the format:

    ````code
    LAMBDA_FUNCTIONS =  ["LambdaToWakeUp","AnotherLambda","YetAnotherLambda"]
    ````

4. Execute this function.  From the command line navigate to the 'lambda' folder of this repo and run `npm run wakeup`  

