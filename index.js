const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hbo9n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log("DB connected");

async function run() {
    try {
        await client.connect();
        const bikeCollection = client.db("royalBikes").collection("bike");

        // get bikes
        app.get('/inventory', async (req, res) => {
            const query = {};
            const cursor = bikeCollection.find(query);
            const bikes = await cursor.toArray();
            // console.log(bikes);
            res.send(bikes);
        });

        // get a single bike
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const bike = await bikeCollection.findOne(query);
            // console.log(bike)
            res.send(bike);
        });

        // add an inventory item
        app.post('/inventory',async(req,res)=>{
            const newService = req.body;
            console.log(newService);
            const result = await bikeCollection.insertOne(newService);
            res.send(result);
        })

        // Delete an inventory item
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await bikeCollection.deleteOne(query);
            res.send(result);
        });

        // update bike quantity
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantiy = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updatedDoc = {
                $set: {
                    quantity: updatedQuantiy.newQuantity
                }
            };

            const result = await bikeCollection.updateOne(filter, updatedDoc, options);
            console.log(result);
            res.send(result);
        })



    }
    finally {

    }
}

run().catch(console.dir);


app.get("/", (rerq, res) => {
    res.send("running Royal-Bikes server");
})

app.listen(port, () => {
    console.log("listening to port", port);
})