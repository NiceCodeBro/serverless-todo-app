import 'source-map-support/register'
import * as uuid from 'uuid'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { parseUserId } from '../../auth/utils';

const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const todosTableName = process.env.TODOS_TABLE;


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event);

  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  const userId = parseUserId(jwtToken);

  const newItem = {
    ...newTodo,
    userId,
    done: false,
    createdAt: new Date().toISOString(),
    todoId: uuid.v4()
  }

  await docClient.put({
    TableName: todosTableName,
    Item: newItem
  }, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log('Data has been successfully added to db', data);           // successful response
  }).promise()


  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}
