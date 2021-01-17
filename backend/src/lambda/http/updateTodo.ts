import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { getUserId } from '../utils';

const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const todosTableName = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  console.log('Processing event: ', event);

  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
  const userId = getUserId(event);

  const params = {
    TableName: todosTableName,
    Key: {
      "todoId": todoId,
      "userId": userId
    },
    UpdateExpression: "set #name = :name, #dueDate=:dueDate, #done=:done",
    ExpressionAttributeValues: {
      ":name": updatedTodo.name,
      ":dueDate": updatedTodo.dueDate,
      ":done": updatedTodo.done
    },
    ExpressionAttributeNames: {
      "#name": "name",
      "#dueDate": "dueDate",
      "#done": "done"
    },
    ReturnValues: "UPDATED_NEW"
  }

  try {
    const updatedTodo = await docClient.update(params, function(err, data) {
      if (err) {
          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      }
  }).promise();

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    };

  } catch (e) {
    console.log("error:", e);

    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: `error ${e}`
    };
  }
}
