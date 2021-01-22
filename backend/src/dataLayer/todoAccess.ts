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

  private async update(params: any) : Promise<any>{
    await this.docClient.update(params, function(err, data) {
      if (err) {
          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      }
    }).promise();
  }

  async updateTodo(todoItem: TodoItem): Promise<any> {
    const updateExpression = "set #name = :name, #dueDate=:dueDate, #done=:done";

    const params = {
      TableName: this.todosTableName,
      Key: {
        "todoId": todoItem.todoId,
        "userId": todoItem.userId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: {
        ":name": todoItem.name,
        ":dueDate": todoItem.dueDate,
        ":done": todoItem.done
      },
      ExpressionAttributeNames: {
        "#name": "name",
        "#dueDate": "dueDate",
        "#done": "done"
      },
      ReturnValues: "UPDATED_NEW"
    }

    await this.update(params);

    return todoItem;
  }

  async updateUrl(userId: string, url: string, todoId: string): Promise<any>  {
    const updateExpression = "set #attachmentUrl = :attachmentUrl";
  
    const params = {
      TableName: this.todosTableName,
      Key: {
        "todoId": todoId,
        "userId": userId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: {
        ":attachmentUrl": url
      },
      ExpressionAttributeNames: {
        "#attachmentUrl": "attachmentUrl"
      },
      ReturnValues: "UPDATED_NEW"
    }

    await this.update(params);
  }
}

function createDynamoDBClient() {
  return new AWS.DynamoDB.DocumentClient();
}