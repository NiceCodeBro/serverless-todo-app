import 'source-map-support/register'
import * as uuid from 'uuid';

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils';


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
  const presignedUrl = await getPutSignedUrl(todoId);

  await attachUrl(event, getImageUrl(todoId), todoId);

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
    Expires: parseInt(signedUrlExpireSeconds),
  });
}

async function attachUrl(event: any, url: string, todoId: string) {
  const userId = getUserId(event);

  const params = {
    TableName: todosTableName,
    Key: {
      "todoId": todoId,
      "userId": userId
    },
    UpdateExpression: "set #attachmentUrl = :attachmentUrl",
    ExpressionAttributeValues: {
      ":attachmentUrl": url
    },
    ExpressionAttributeNames: {
      "#attachmentUrl": "attachmentUrl"
    },
    ReturnValues: "UPDATED_NEW"
  }

  await docClient.update(params, function(err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
  }).promise();
}

function getImageUrl(todoId: string) {
  return `https://${todosImagesBucketName}.s3.amazonaws.com/${todoId}`

}