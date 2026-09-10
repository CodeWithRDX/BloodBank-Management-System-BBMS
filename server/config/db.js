import mongoose from 'mongoose';

let cachedConnection = null;

const connectDB = async () => {
  // If connection is already open, reuse it immediately (serverless warm start)
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    // Support both MONGODB_URI (standard on Vercel) and MONGO_URI
    const envUri = (process.env.MONGODB_URI || process.env.MONGO_URI)?.trim();
    const mongoUri = envUri || 'mongodb://127.0.0.1:27017/bloodbank';

    if (!envUri) {
      console.warn(`⚠️ MONGODB_URI/MONGO_URI not set; using default ${mongoUri}`);
      if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
        throw new Error('MONGODB_URI or MONGO_URI is required in production');
      }
    }

    cachedConnection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`✅ MongoDB Connected: ${cachedConnection.connection.host}`);
    return cachedConnection;
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    // In serverless, do not call process.exit(1) to avoid killing the container
    if (!process.env.VERCEL) {
      // Exit only when running as a dedicated local/standalone process
      // process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
