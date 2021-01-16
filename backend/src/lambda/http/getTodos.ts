import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { parseUserId } from '../../auth/utils';

var AWS = require("aws-sdk");


var docClient = new AWS.DynamoDB.DocumentClient();

const todosTableName = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const authHeader = event.headers.Authorization
  const authSplit = authHeader.split(" ")
  const userId = parseUserId(authSplit[1])

  const result = await docClient.query({
    TableName : todosTableName,
    IndexName: "UserIdIndex",
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
        ':userId': userId
    },

    ScanIndexForward: false
  }).promise()

  if (result) {
    console.log('Result: ', result)

    const items = result.Items

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            items
        })
    }
  }

  return {
    statusCode: 404,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  };

}
