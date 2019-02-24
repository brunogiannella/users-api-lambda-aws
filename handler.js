'use strict';

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const uuid = require('uuid');
const app = express()
const AWS = require('aws-sdk');

const USERS_TABLE = process.env.USERS_TABLE;

const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({ strict: false }));

app.get('/users', function (req, res) {
  const params = {
    TableName: USERS_TABLE
  }

  dynamoDb.scan(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not get users' });
    }

    if (result.Items) {
      res.json(result.Items);
    } else {
      res.status(204).json();
    }
  });
})

app.get('/users/:userId', function (req, res) {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  }

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not get user' });
    }

    if (result.Item) {
      const {userId, name} = result.Item;
      res.json({ userId, name });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });
})


// Create User endpoint
app.post('/users', function (req, res) {
  const { name } = req.body;

  if (typeof name !== 'string') {
    res.status(400).json({ error: '"name" must be a string' });
  }


  const params = {
    TableName: USERS_TABLE,

    Item: {
      userId: uuid.v4(),
      name: name,
    },
  };

  dynamoDb.put(params, (error) => {
    
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not create user' });
    }

    res.json(params.Item);
  });

})


module.exports.handler = serverless(app);