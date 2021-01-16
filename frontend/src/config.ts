const apiId = ''
const apiRegion = ''
export const apiEndpoint = `https://${apiId}.execute-api.${apiRegion}.amazonaws.com/dev`

export const authConfig = {
  domain: '',                   // Auth0 domain
  clientId: '',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
