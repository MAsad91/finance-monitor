import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI or MONGO_URI environment variable inside .env"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Ensure we're connecting to the finance-monitor database
    let connectionString = MONGODB_URI;
    
    // Check if database name is already in the connection string
    // Format: mongodb+srv://user:pass@cluster.net/database?options
    const hasDatabase = /mongodb(\+srv)?:\/\/[^\/]+\/[^?]+/.test(connectionString);
    
    if (!hasDatabase) {
      // Extract query string if present
      const queryMatch = connectionString.match(/\?.*$/);
      const queryString = queryMatch ? queryMatch[0] : '';
      const baseUri = connectionString.replace(/\?.*$/, '');
      
      // Add database name before query string
      if (baseUri.endsWith('/')) {
        connectionString = `${baseUri}finance-monitor${queryString}`;
      } else {
        connectionString = `${baseUri}/finance-monitor${queryString}`;
      }
    }
    
    const opts = {
      bufferCommands: false,
      dbName: 'finance-monitor', // Explicitly set database name
    };

    console.log("Connecting to database: finance-monitor");
    cached.promise = mongoose.connect(connectionString, opts).then((mongoose) => {
      console.log("✓ Connected to database: finance-monitor");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

