
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
const util = require('./util.js');

const moment = require('moment');
const uuidv4 = require('uuid/v4');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

exports.handler = async (event) => {
  try {
    let item = JSON.parse(event.body).Item;
    item.user_id = util.getUserId(event.headers)
    item.user_name = util.getUserName(event.headers)
    item.note_id = item.user_id + ":" + uuidv4();
    item.timestamp = moment().unix();
    item.expires = moment().add(90, 'days').unix();

    let data = await dynamodb.put({
      TableName: tableName,
      Item: item
    }).promise();

    return {
      statusCode: 200,
      headers: util.getResponseHeaders(),
      body: JSON.stringify(item)
    }
  } catch (err) {
    console.log({err})
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      headers: util.getResponseHeaders(),
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        error: err.message ? err.message: "Unknown Error",
      })
    };
  }
}