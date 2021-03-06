const aws = require('aws-sdk');
const lambda_handler = require('../../lambda.js');

jest.mock('aws-sdk', () => {
  const mDocumentClient = { put: jest.fn() };
  const mDynamoDB = { DocumentClient: jest.fn(() => mDocumentClient) };
  return { DynamoDB: mDynamoDB };
});

const mDynamoDb = new aws.DynamoDB.DocumentClient();

describe('Should process the message and insert dynamo', function () {

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('Verifies the payload is processed', async () => {

    var payload = {
      messageId: "19dd0b57-b21e-4ac1-bd88-01bbb068cb78",
      receiptHandle: "MessageReceiptHandle",
      body: {
        Type : "Notification",
        MessageId : "165545c9-2a5c-472c-8df2-7ff2be2b3b1b",
        Token : "2336412f37...",
        TopicArn : "arn:aws:sns:us-east-1:123456789012:MyTopic",
        Message : "{\"id\": \"1\",\"pid\": \"1\",\"sub\": \"123\",\"datetime\":\"2021-08-28T15:59:07.088Z\",\"api\": \"localhost\",\"scope\": \"local\",\"may_act\": \"rw\",\"object_request\":{},\"object_return\":{}}"
      },
      attributes: {
        ApproximateReceiveCount: "1",
        SentTimestamp: "1523232000000",
        SenderId: "123456789012",
        ApproximateFirstReceiveTimestamp: "1523232000001"
      },
      messageAttributes: {},
      md5OfBody: "7b270e59b47ff90a553787216d55d91d",
      eventSource: "aws:sqs",
      eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:SimpleQueue",
      awsRegion: "us-east-1"
    }

    mDynamoDb.put.mockImplementationOnce(() => ({ promise: jest.fn().mockReturnValue(Promise.resolve(true)) }));

    await expect(lambda_handler.handler(payload, null)).resolves.not.toThrow();
  });
});

