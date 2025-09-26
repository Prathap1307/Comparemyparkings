// lib/aws-config.js

import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

const REGION = 'eu-north-1'; // Your AWS region

const ddbClient = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.APP_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_SECRET_ACCESS_KEY,
  },
});

export const cognitoClient = new CognitoIdentityProviderClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.APP_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_SECRET_ACCESS_KEY,
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export { ddbDocClient };



