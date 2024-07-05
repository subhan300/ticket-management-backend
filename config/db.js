const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
// const databaseUrl="mongodb://localhost:27017/test" 

const databaseUrl=process.env.MONGODB_URI

const connectDB = async () => {
  try {
    await mongoose.connect(databaseUrl,
    //    {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // }
  );
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
