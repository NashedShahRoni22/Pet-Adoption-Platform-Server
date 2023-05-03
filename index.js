const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());

//mongobd connection
const uri =
  "mongodb+srv://petAdoptionPlatform:rmxUABzr915NHN2T@cluster0.lsyvijc.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const petsCollection = client.db("PAPDB").collection("Pets");
    const reviewsCollection = client.db("PAPDB").collection("Reviews");
    const bookingsCollection = client.db("PAPDB").collection("Bookings");
    //get all pets
    app.get("/pets", async (req, res) => {
      const query = {};
      const cursor = petsCollection.find(query);
      const pets = await cursor.toArray();
      res.send(pets);
    });
    //post a pet
    app.post("/pets", async(req, res)=>{
      const pet = req.body;
      const result = await petsCollection.insertOne(pet);
      res.send(result);
    })

    //pets details api
    app.get("/pets/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id:  new ObjectId(id) };
      const petDetails = await petsCollection.findOne(query);
      res.send(petDetails);
    });

    //reviews post api
    app.post("/reviews", async(req, res)=>{
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    //reviews get api for individual pet card
    app.get("/reviews", async(req,res)=>{
      let query = {};
      if(req.query.petId){
        query = {
          petId:req.query.petId
        }
      }
      const cursor = reviewsCollection.find(query); 
      const reviews = await cursor.toArray();
      res.send(reviews);
    })

    //post of pets get api for idividual user
    app.get("/myposts", async(req,res)=>{
      let query = {};
      if(req.query.ownerEmail){
        
        query = {
          ownerEmail:req.query.ownerEmail
        }
      }
      const cursor = petsCollection.find(query); 
      const reviews = await cursor.toArray();
      res.send(reviews);
    })

    //reviews get api for idividual user
    app.get("/myreviews", async(req,res)=>{
      let query = {};
      if(req.query.userEmail){
        
        query = {
          userEmail:req.query.userEmail
        }
      }
      const cursor = reviewsCollection.find(query); 
      const reviews = await cursor.toArray();
      res.send(reviews);
    })
    //save bookings
    app.post('/bookings', async(req, res)=>{
      const bookings = req.body;
      const query = {
        buyerEmail: bookings.buyerEmail,
        productId: bookings.productId,
      }

      const alreadyBooked = await bookingsCollection.find(query).toArray();
      if(alreadyBooked.length){
        const message = `You have already booked ${bookings.name}!`
        return res.send({acknowledged: false, message});
      }
      const result = await bookingsCollection.insertOne(bookings);
      res.send(result);
    })
    //bookings get api for idividual user
    app.get("/mybookings", async(req,res)=>{
      let query = {};
      if(req.query.buyerEmail){
        
        query = {
          buyerEmail:req.query.buyerEmail
        }
      }
      const cursor = bookingsCollection.find(query); 
      const bookings = await cursor.toArray();
      res.send(bookings);
    })
    //delete a bookings
    app.delete('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    })
    //delete a review
    app.delete('/reviews/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    })
    //delete a review
    app.delete('/myposts/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await petsCollection.deleteOne(query);
      res.send(result);
    })

    //paid product
    app.put("/paidproducts/:id", async(req, res)=>{
      const id = req.params.id;
      const filter ={_id: new ObjectId(id)};
      const option = {upsert: true};
      const updatedDoc = {
        $set:{
          isPaid: true
        }
      }
      const result = await petsCollection.updateOne(filter, updatedDoc, option);
      res.send(result);
    })
    //paid booking product
    app.put("/paidbookingproducts/:id", async(req, res)=>{
      const id = req.params.id;
      const filter ={_id: new ObjectId(id)};
      const option = {upsert: true};
      const updatedDoc = {
        $set:{
          isPaid: true
        }
      }
      const result = await bookingsCollection.updateOne(filter, updatedDoc, option);
      res.send(result);
    })
     

  } finally {
  }
}

run().catch((e) => console.error(e));

app.get("/", (req, res) => {
  res.send("Pet Adoption Platform Server is Running");
});

app.listen(port, () => {
  console.log(`Pet Adoption Platform Server Running on ${port}`);
});
