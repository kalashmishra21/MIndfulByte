const mongoose = require('mongoose');

// Never queue login queries while the database is disconnected.
mongoose.set('bufferCommands', false);
const connectDB = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 15000,
    maxPoolSize: 10,
    maxTimeMS: 10000,
  });
  console.log('MongoDB connected');
};
module.exports = connectDB;
