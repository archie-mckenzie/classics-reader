const { MongoClient } = require('mongodb');

let cachedClient;
let connectToMongoDB;

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        cachedClient = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
      global._mongoClientPromise = cachedClient.connect();
    }
    connectToMongoDB = global._mongoClientPromise;
  } else {
    cachedClient = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
    connectToMongoDB = cachedClient.connect();
}

export default connectToMongoDB;