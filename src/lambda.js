'use strict'

const AWS = require('aws-sdk')

exports.handler = async (event, context) => {

    const sqsSuccessMessages = []
   
    try {
        const records = event.Records ? event.Records : [event]

        for (const record of records) {
            await processMessage(record)
            sqsSuccessMessages.push(record)
        }
    } catch (e) {
        if (sqsSuccessMessages.length > 0) {
            await deleteSuccessMessages(sqsSuccessMessages)
        }

        throw new Error(e)
    }
}

async function processMessage(record) {

    const { body } = record  

    const objectMessage = JSON.parse(body.Message)

    const params = {      
        TableName: process.env.AWS_DYNAMODB_TABLE,      
        Item:{          
            "pk": `ID#${objectMessage.id}+${objectMessage.pid}`,
            "sk": `SUB#${objectMessage.sub}:DATE#"${objectMessage.datetime}}`,          
            "api": objectMessage.api,          
            "scope": objectMessage.scope,          
            "may_act": objectMessage.may_act,          
            "object_request": objectMessage.object_request,          
            "object_return": objectMessage.object_return      
        }    
    }; 

    await insertDynamo(params) 
}

const deleteSuccessMessages = async messages => {
    const sqs = new AWS.SQS({
        region: process.env.AWS_DEFAULT_REGION
    })

    for (const message of messages) {
        await sqs.deleteMessage({
            QueueUrl: getQueueUrl({
            sqs,
            eventSourceARN: message.eventSourceARN
            }),
            ReceiptHandle: message.receiptHandle
        }).promise()
    }
};

async function insertDynamo(params) {

    const docClient = process.env.AWS_DYNAMODB_ENDPOINT ? 
    new AWS.DynamoDB.DocumentClient({
        region: process.env.AWS_DEFAULT_REGION, 
        endpoint: process.env.AWS_DYNAMODB_ENDPOINT
    }) : new AWS.DynamoDB.DocumentClient({
        region: process.env.AWS_DEFAULT_REGION, 
    })

    try {      
        await docClient.put(params).promise()      
        console.debug('Added item: \r\n' + JSON.stringify(params))
    } catch (err) {      
        console.debug('Unable to add item. Error JSON: \r\n' + JSON.stringify(err)) 
        throw new Error(err)
    }
}

function getQueueUrl ({ sqs, eventSourceARN }) {
    const [, , , , accountId, queueName] = eventSourceARN.split(':')
     
    return `${sqs.endpoint.href}${accountId}/${queueName}`
}