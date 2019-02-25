/*
Anonymous Activity Voter API
19/02/24 Timothy Ngai - got votes to save properly
19/02/23 Timothy Ngai - got the randomized lists to add dynamically to a dropdown, got randomized list to display with vote count (a bit sluggish to update at times though)
19/02/21 Timothy Ngai - create backend API /server for anonymous activ voter
*/ 
 
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const bcrypt = require('bcrypt');
const saltRounds = 10; 

const cors = require('cors') 
 
 //connect to a db instead of hardcoding data.  Using knex.js (npm install knex) and then
 //  running an install based on the db you are using i.e. (npm install pg) for postgresql
 const knex = require('knex');
 
 //run a function to initialize everything
 //127.0.0.1 is localhost
 const pgDB = knex({
   client: 'pg',
  connection: {
    connectionString : process.env.DATABASE_URL,
    ssl: true,
  }
});
  
app.use(bodyParser.urlencoded({extended:false}));  //add to setup middleware to parse urlencoded, aka postman's form data 
app.use(bodyParser.json());  //add to setup middleware to parse json, else it'll send empty object

app.use(cors());
 
app.get('/', (req, res) => { 
	res.send('starting page server anon act');  
})
	 
//moved the logic out to it's own file.  File needed access to postgresDB and bcrypt, so passing those in as well
//post to hide the input coming in
const activData = require('./controllers/signin');
app.post('/signin', (req,res) => { 
	activData.getActivities(req, res, pgDB, bcrypt, saltRounds) 
})

const handleSetup = require('./controllers/setup');
app.post('/setup', (req,res) => { 
 console.log('before setup func',pgDB);
	handleSetup.setupRoom(req, res, pgDB) 
})

const roomFile = require('./controllers/room');
app.post('/room', (req,res) => { 
 console.log('before setup func room',pgDB);
	roomFile.loadRoom(req, res, pgDB) 
}) 
app.post('/roomVote', (req,res) => { 
 console.log('before setup func roomvote',pgDB);
	roomFile.saveVote(req, res, pgDB) 
})
app.post('/roomItems', (req,res) => { 
 console.log('before setup func roomItems',pgDB);
	roomFile.loadVotes(req, res, pgDB, knex) 
})
app.post('/roomLoadVote', (req,res) => { 
 console.log('before setup func roomItems',pgDB);
	roomFile.loadUserVotes(req, res, pgDB, knex) 
})
	 
//run the port we get from heroku, else run 3000
app.listen(process.env.PORT || 3000, ()=> { console.log(`a function to run right after app.listen, app is running on port ${process.env.PORT}`)});
 

 