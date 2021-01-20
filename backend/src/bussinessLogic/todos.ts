import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { parseUserId } from '../auth/utils';

const todoAccess = new TodoAccess()

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const userId = parseUserId(jwtToken)
  
  const newItem = {
    ...createTodoRequest,
    userId,
    done: false,
    createdAt: new Date().toISOString(),
    todoId: uuid.v4()
  }

  return await todoAccess.createTodo(newItem);
}

export async function deleteTodo(todoId: string, userId: string): Promise<any> {
  return await todoAccess.deleteTodo(todoId, userId);
}

export async function getTodos(userId: string): Promise<any> {
  return await todoAccess.getTodos(userId);
}