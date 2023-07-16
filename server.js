'use strict'
const { env } = require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs')

const { Client } = require('@elastic/elasticsearch');
const client = new Client({
    node: process.env.elastic_server,
    auth: {
        username: process.env.elastic_userid,
        password: process.env.elastic_password
    },
    tls: {
        ca: fs.readFileSync('./http_ca.crt'),
        rejectUnauthorized: false
    }
})

var app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

// Serve static files
app.use(express.static('public'));

app.post('/search', async (req, res) => {
    const { field, query } = req.body;

    try {
        const response = await client.search({
            index: 'google',
            body: {
              query: {
                match: { [field]: query }
              },
              _source: ['FIELD1', 'title', 'author', 'description', 'published_date'] //we Specify the fields to retrieve
            }
          });
          

          const hits = response.hits.hits;
          const results = hits.map(hit => {
            const { FIELD1, title, author, description, published_date } = hit._source;
            return { FIELD1, title, author, description, published_date };
          });
          res.send(results);
    } catch (error) {
        console.error('Error occurred during the search:', error);
        res.status(500).send('An error occurred during the search');
    }
});

app.post('/delete', async (req, res) => {
    const { id } = req.body;
  
    try {
      await client.delete({
        index: 'google',
        id: FIELD1
      });
      res.sendStatus(200);
    } catch (error) {
      console.error('Error occurred during the delete:', error);
      res.status(500).send('An error occurred during the delete');
    }
  });

const server = app.listen(5678); //start the server
console.log('Server is running...');
console.log('http://localhost:' + server.address().port)