import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem';

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTableName = process.env.TODOS_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX) {
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
        TableName: this.todosTableName,
        Item: todoItem
      }, function(err, data) {
        if (err) console.log(err, err.stack);                                   // an error occurred
        else     console.log('Data has been successfully added to db', data);   // successful response
      }).promise()

    return todoItem;
  }

  async deleteTodo(todoId: string, userId: string): Promise<any> {
    await this.docClient.delete({
      TableName: this.todosTableName,
      Key: {
        "userId": userId,
        "todoId": todoId
      }
    }).promise();
  }

  async getTodos(userId: string): Promise<any> {
    return await this.docClient.query({
      TableName : this.todosTableName,
      IndexName: this.userIdIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
      },
      ScanIndexForward: false
    }).promise();
  }
}

function createDynamoDBClient() {
  return new AWS.DynamoDB.DocumentClient();
}
