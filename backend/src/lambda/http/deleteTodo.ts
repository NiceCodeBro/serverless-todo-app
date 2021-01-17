import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils';

const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const todosTableName = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event);

  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);

  const todoItemToDelete = {
    TableName: todosTableName,
    Key:{
        "todoId": todoId,
        "userId": userId
    }
  }

  try{
    await docClient.delete(todoItemToDelete).promise()
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
   };
  } catch(err) {
    console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: ''
      };
  }
}
