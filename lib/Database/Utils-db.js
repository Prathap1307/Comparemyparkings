import { PutCommand, GetCommand, UpdateCommand, DeleteCommand} from '@aws-sdk/lib-dynamodb';
import {ScanCommand} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ddbDocClient } from "../aws-config";


export async function createItem(tableName, itemData) {
  try {
    const params = {
      TableName: tableName,
      Item: itemData, // Ensure id is a string
    };

    await ddbDocClient.send(new PutCommand(params)); // Use DocumentClient
    return itemData;
  } catch (err) {
    console.error(`Error creating item in ${tableName}:`, err);
    throw err;
  }
}


export async function getAllItems(tableName) {
  console.log(tableName)
  try {
    const params = {
      TableName: tableName,
    };

    const data = await ddbDocClient.send(new ScanCommand(params));
    console.log("data",data.Items)
    return data.Items
      ? data.Items.filter(Boolean).map(item => unmarshall(item))
      : [];
  } catch (err) {
    console.error(`Error fetching items from ${tableName}:`, err);
    return [];
  }
}


export async function getItemById(tableName, id) {
  try {
    const params = {
      TableName: tableName,
      Key: marshall({ id }),
    };

    const data = await ddbDocClient.send(new GetCommand(params));
    return data.Item ? unmarshall(data.Item) : null;
  } catch (err) {
    console.error(`Error fetching item from ${tableName}:`, err);
    return null;
  }
}


// lib/Database/Utils-db.js
export async function updateItem(tableName, id, updateData) {
  try {
    const params = {
      TableName: tableName,
      Key: { id },
      UpdateExpression: "set " + Object.keys(updateData)
        .map(k => `#${k} = :${k}`)
        .join(", "),
      ExpressionAttributeNames: Object.keys(updateData)
        .reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
      ExpressionAttributeValues: Object.entries(updateData)
        .reduce((acc, [key, value]) => ({ ...acc, [`:${key}`]: value }), {}),
      ReturnValues: "ALL_NEW"
    };

    const data = await ddbDocClient.send(new UpdateCommand(params));
    return data.Attributes;
  } catch (err) {
    console.error(`Error updating item in ${tableName}:`, err);
    throw err;
  }
}

export async function deleteItem(tableName, id) {
  try {
    const params = {
      TableName: tableName,
      Key: { id }, // No need to marshall manually with DocumentClient
    };

    await ddbDocClient.send(new DeleteCommand(params));
    return { id };
  } catch (err) {
    console.error(`Error deleting item from ${tableName}:`, err);
    throw err;
  }
}

export async function getUserByClerkId(tableName, clerkUserId) {
  try {
    const params = {
      TableName: tableName,
      Key: { id: clerkUserId },
    };

    const data = await ddbDocClient.send(new GetCommand(params));
    return data.Item || null;
  } catch (err) {
    console.error("Error fetching user:", err);
    return null;
  }
}

export async function getVehiclesByUserId(tableName, userId) {
  try {
    const params = {
      TableName: tableName,
      FilterExpression: "user_id = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
      },
    };

    const data = await ddbDocClient.send(new ScanCommand(params));
    return data.Items || [];
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    return [];
  }
}

export async function saveUserVehicles(tableName, userId, vehicles) {
  try {
    // 1️⃣ Delete existing vehicles
    const existing = await getVehiclesByUserId(tableName, userId);

    for (const v of existing) {
      await deleteItem(tableName, v.id);
    }

    // 2️⃣ Insert new vehicles
    for (const v of vehicles) {
      await createItem(tableName, {
        id: uuidv4(),
        user_id: userId,
        registration: v.registration,
        is_default: v.is_default || false,
        created_at: new Date().toISOString(),
      });
    }

    return true;
  } catch (err) {
    console.error("Error saving vehicles:", err);
    throw err;
  }
}

