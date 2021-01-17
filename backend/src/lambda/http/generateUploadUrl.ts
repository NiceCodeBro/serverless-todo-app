import 'source-map-support/register'
import * as uuid from 'uuid';

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'


const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});

const docClient = new AWS.DynamoDB.DocumentClient();
const todosTableName = process.env.TODOS_TABLE;
const todosImagesTableName = process.env.TODOS_TABLE;
const todosImagesBucketName = process.env.TODOS_S3_BUCKET;
const signedUrlExpireSeconds = process.env.SIGNED_URL_EXPIRATION;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event);

  const todoId = event.pathParameters.todoId

  //const imageId:uuid = uuid.v4();
  
  const presignedUrl = await getPutSignedUrl(todoId);

  console.log("presignedURL as in generateuploadurl:", presignedUrl);
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
        uploadUrl: presignedUrl
    })
  };
}

// Generates an AWS signed URL for uploading objects
async function getPutSignedUrl( key: string ): Promise <string> {
  return s3.getSignedUrl('putObject', {
    Bucket: todosImagesBucketName,
    Key: key,
    Expires: signedUrlExpireSeconds,
  });
}