const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const jwt = require('jsonwebtoken');

const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// verify jwt token
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
    });
    console.log('inside verifyJWT ', authHeader);
    next();
}



// Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hbo9n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log("DB connected");

async function run() {
    try {
        await client.connect();
        const bikeCollection = client.db("royalBikes").collection("bike");
        const myitemCollection = client.db("royalBikes").collection("myitem");
        // console.log(bikeCollection, myitemCollection);

        // auth api
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })


        // get bikes api
        app.get('/inventory', async (req, res) => {

            // const decodedEmail = req.decoded.email;
            // auth header
            // const authHeader = req.headers.authorization;
            // console.log(authHeader);

            // const email = req.query.email;
            const item = req.query.item;
            console.log(item);
            let query = {};
            let bikes;
            // --------------
            // if(email === decodedEmail){

            // }
            // else{
            //     res.status(403).send({message: 'forbidden access'})
            // }

            // -----------
            // if (email) {
            //     query = { email: email }
            // }

            if (item) {
                const cursor = bikeCollection.find(query);
                bikes = await cursor.limit(6).toArray();
            } else {
                const cursor = bikeCollection.find(query);
                bikes = await cursor.toArray();
            }
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
        app.post('/inventory', async (req, res) => {
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

        // get new inventory *my item api
        app.get('/inventoryitem', async (req, res) => {
            const email = req.query.email;
            console.log(email);
            let query; 
            let myitem;
            if(email){
                query = { email: email };
            }else{
                query={};
            }
            const cursor = myitemCollection.find(query);
            myitem = await cursor.toArray();
            res.send(myitem);
        })

        // add new inventory *my item api
        app.post('/inventoryitem', async (req, res) => {
            const newItem = req.body;
            console.log(newItem);
            const result = await myitemCollection.insertOne(newItem);
            res.send(result);
        })

         // Delete an inventory item
         app.delete('/inventoryitem/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await myitemCollection.deleteOne(query);
            res.send(result);
        });

        // get a single my item**
        app.get('/inventoryitem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const bike = await bikeCollection.findOne(query);
            // console.log(bike)
            res.send(bike);
        });

        

        



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