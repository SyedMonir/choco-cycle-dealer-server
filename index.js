const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// JWT
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' });
    }
    req.decoded = decoded;
    console.log('decoded', decoded);
    next();
  });
}

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

    // Add one cycle
    app.post('/cycle', async (req, res) => {
      const item = req.body;
      console.log(item);
      const doc = {
        ...item,
      };
      const result = await cycleCollection.insertOne(doc);
      res.send(result);
    });

    // Cycle By ID
    app.get('/cycle/:cycleId', async (req, res) => {
      const id = req.params.cycleId;
      const query = { _id: ObjectId(id) };
      const cycle = await cycleCollection.findOne(query);
      res.send(cycle);
    });

    // My Cycle
    app.get('/my-cycles', verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (decodedEmail === email) {
        const query = { email };
        const cursor = cycleCollection.find(query);
        const cycles = await cursor.toArray();
        res.send(cycles);
      } else {
        res.status(403).send({ message: 'Forbidden access' });
      }
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
    app.delete('/cycle/:cycleId', async (req, res) => {
      const id = req.params.cycleId;
      const query = { _id: ObjectId(id) };
      const result = await cycleCollection.deleteOne(query);
      res.send(result);
    });
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
