const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c0tgt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("TodoTask").collection("task");

    app.get("/task", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    // POST
    app.post("/task", async (req, res) => {
      const newTask = req.body;
      const result = await serviceCollection.insertOne(newTask);
      res.send(result);
    });

    // user task
    app.get("/task/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const cursor = await serviceCollection.find(query);
      const tasks = await cursor.toArray();
      console.log(tasks);
      res.send(tasks);
    });

    // update task
    app.put("/task/:email", async (req, res) => {
      const id = req.params.id;
      const updateDescription = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          description: updateDescription.description,
        },
      };
      const result = await serviceCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // DELETE
    app.delete("/task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("To-Do server");
});

app.listen(port, () => {
  console.log("Listening to port", port);
});
