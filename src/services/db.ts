import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  PutItemInput,
} from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { v4 as uuid4 } from "uuid";

const dbClient = new DynamoDBClient({
  region: "us-east-1",
});

interface ITableName {
  tableName: string;
}

interface ISession extends ITableName {
  id?: string;
  sessionData: string;
  ttl: number;
}

interface IImageMapper extends ITableName {
  imageIds: string[];
  sessionId: string;
}

export const createSession = async (session: ISession) => {
  const now = new Date().toISOString();
  const sessionId = uuid4();
  const params = {
    TableName: session.tableName,
    Item: {
      id: { S: sessionId },
      sessionData: { S: session.sessionData },
      ttl: { N: session.ttl.toString() },
      createdAt: { S: now },
      updatedAt: { S: now },
    },
  };

  try {
    const session = await dbClient.send(new PutItemCommand(params));
    return {
      sessionId,
      session: session.Attributes,
    };
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const updateSession = async (session: ISession) => {
  const updateCmd = new UpdateCommand({
    TableName: session.tableName,
    Key: {
      id: session.id,
    },
    UpdateExpression: "SET sessionData = :sessionData, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":sessionData": JSON.stringify(
        session?.sessionData ? session.sessionData : {}
      ),
      ":updatedAt": new Date().toISOString(),
    },
    ReturnValues: "ALL_NEW",
  });

  try {
    const response = await dbClient.send(updateCmd);
    console.log(response);
    return response;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export const createImageMapper = async (imageMapper: IImageMapper) => {
  const now = new Date().toISOString();
  const params = {
    TableName: imageMapper.tableName,
    Item: {
      id: { S: uuid4() },
      imageIds: { SS: imageMapper.imageIds },
      sessionId: { S: imageMapper.sessionId },
      count: { N: imageMapper.imageIds.length.toString() },
      createdAt: { S: now },
      updatedAt: { S: now },
    },
  };

  try {
    await dbClient.send(new PutItemCommand(params));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const verifySessionIsValid = async (sessionId: string) => {
  const params = {
    TableName: process.env.SESSION_TABLE as string,
    Key: {
      id: { S: sessionId },
    },
  };

  try {
    const session = await dbClient.send(new GetItemCommand(params));
    if (
      session.Item &&
      Number(session.Item.ttl.N) > Math.floor(Date.now() / 1000)
    ) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const listImageMappers = async (sessionId: string) => {
  const params = {
    TableName: process.env.IMAGE_MAPPER_TABLE as string,
    Key: {
      id: { S: sessionId },
    },
  };

  try {
    const imageMappers = await dbClient.send(new GetItemCommand(params));
    return imageMappers;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
