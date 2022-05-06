const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hbo9n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log("DB connected");

async function run(){
    try{
        await client.connect();
        const bikeCollection = client.db("royalBikes").collection("bike");

        query = {};
        const cursor = bikeCollection.find(query);
        const bikes = await cursor.toArray();
        console.log(bikes);

    }
    finally{

    }
}

run().catch(console.dir);


app.get("/", (rerq, res) => {
    res.send("running Royal-Bikes server");
})

app.listen(port, () => {
    console.log("listening to port", port);
})