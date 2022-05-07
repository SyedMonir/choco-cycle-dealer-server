const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cycle.iuhgf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    console.log('Choco-Cycle Database Connected..');
    const cycleCollection = client.db('choco-cycle').collection('cycles');

    // ALL Cycle
    app.get('/cycle', async (req, res) => {
      const query = {};
      const cursor = cycleCollection.find(query);
      const cycles = await cursor.toArray();
      res.send(cycles);
    });

    // Cycle By ID
    app.get('/cycle/:cycleId', async (req, res) => {
      const id = req.params.cycleId;
      const query = { _id: ObjectId(id) };
      const cycle = await cycleCollection.findOne(query);
      res.send(cycle);
    });

    // Update cycle
    app.put('/cycle/:cycleId', async (req, res) => {
      const id = req.params.cycleId;
      const updatedQuantity = req.body;
      // console.log(updatedQuantity);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { quantity: updatedQuantity.totalQuantity },
      };
      const result = await cycleCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Delete
    app.delete('/cycle/:cycleId'),
      async (req, res) => {
        const id = req.params.cycleId;
        console.log(id);
        const query = { _id: ObjectId(id) };
        const result = await cycleCollection.deleteOne(query);
        res.send(result);
      };
  } finally {
    console.log('Error From Finally');
  }
}
run().catch(console.dir);

// Home API
app.get('/', async (req, res) => {
  res.send('Choco Cycle Server Started..');
});

// Port
app.listen(port, () => {
  console.log('Choco Cycle Server Started..');
});
