const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
const cors = require('cors')
const port = process.env.PORT || 5000
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
const stripe = require('stripe')(process.env.STRIPE_SECRET);


// midleware
app.use(cors());
app.use(express.json())

// mongodb uri and client
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kadog.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('Xtreme_Moto_Zone');
        const listCollection = database.collection('orders');
        const productCollection = database.collection('products')
        const itemCollection = database.collection('items')
        const userCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');
        // const paymentIntent = database.collection('paymentIntent');
        console.log('conected successfully');

        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            console.log(query);
            const cursor = listCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        });


        app.post('/orders', async (req, res) => {
            const orders = req.body;
            console.log(orders);
            const result = await listCollection.insertOne(orders);
            console.log(result);
            res.json(result);
        });

        app.post('/products', async (req, res) => {
            const products = req.body;
            const result = await productCollection.insertOne(products);
            res.json(result);
        });
        app.get('/products', async (req, res) => {

            const cursor = productCollection.find({});
            const product = await cursor.toArray();
            res.json(product);
        });
        app.get('/items', async (req, res) => {
            // const email = req.query.email;
            // const query = { email: email }
            // console.log(query);
            const cursor = itemCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        });

        app.get('/users', async (req, res) => {
            // const email = req.query.email;
            // const query = { email: email }
            // console.log(query);
            const cursor = userCollection.find({});
            const users = await cursor.toArray();
            res.json(users);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const users = await userCollection.findOne(query);
            console.log(users);
            let isAdmin = false;
            if (users?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        app.post('/reviews', async (req, res) => {
            const orders = req.body;
            console.log(orders);
            const result = await reviewsCollection.insertOne(orders);
            console.log(result);
            res.json(result);
        });
        app.get('/reviews', async (req, res) => {
            // const email = req.query.email;
            // const query = { email: email }
            // console.log(query);
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.json(reviews);
        });
        // getting payment data by id
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await listCollection.findOne(query);
            res.json(result);
        })
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    payment: payment
                }
            };
            const result = await listCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // Delete API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await listCollection.deleteOne(query)
            console.log('deleting user with id', result);
            res.json(result);
        })
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query)
            console.log('deleting user with id', result);
            res.json(result);
        })
        app.post('/paymentIntent', async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                payment_method_types: ['card']
            });
            console.log(paymentIntent);
            res.json({ clientSecret: paymentIntent.client_secret })
        })
    }

    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('welcome to Niche Server. ');
})



app.listen(port, () => {
    console.log('listening to port', port);
})