import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuid4 } from "uuid";

const dbClient = new DynamoDBClient({
  region: "us-east-1",
});

interface ITableName {
  tableName: string;
}

interface ISession extends ITableName {
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

export const createImageMapper = async (imageMapper: IImageMapper) => {
  const now = new Date().toISOString();
  const params = {
    TableName: imageMapper.tableName,
    Item: {
      id: { S: uuid4() },
      imageIds: { SS: imageMapper.imageIds },
      sessionId: { S: imageMapper.sessionId },
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
