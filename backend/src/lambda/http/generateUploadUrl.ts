import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils';

import { getPresignedUrl, attachUrl } from '../../bussinessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event);

  const todoId = event.pathParameters.todoId  
  const presignedUrl = await getPresignedUrl(todoId);
  const userId = getUserId(event);

  await attachUrl(userId, todoId);
  
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