const apiId = 'ortw10h3ug'
const apiRegion = 'eu-centra-1'
export const apiEndpoint = `https://${apiId}.execute-api.${apiRegion}.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-xx-selim.eu.auth0.com',                   // Auth0 domain
  clientId: 'TqWNsK6DNc2TNIT3zPVMfGb2p3KxC6pF',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
