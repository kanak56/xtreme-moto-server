const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
const cors = require('cors')
const port = process.env.PORT || 5000
require('dotenv').config()


// midleware
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kadog.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.get('/', (req, res) => {
    res.send('welcome to Niche Server. ');
})

app.listen(port, () => {
    console.log('listening to port', port);
})