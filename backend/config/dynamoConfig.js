const AWS = require("aws-sdk");

const isLambda = !!process.env.LAMBDA_TASK_ROOT; // Detect if running on AWS Lambda

if (!isLambda) {
  require("dotenv").config(); // Load .env only in local environment
}

// AWS SDK Configuration
AWS.config.update({
  region: process.env.AWS_REGION || "ap-south-1",
  ...(isLambda
    ? {} // Use IAM role in Lambda (No need for access keys)
    : {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }),
});

const docClient = new AWS.DynamoDB.DocumentClient();
module.exports = docClient;