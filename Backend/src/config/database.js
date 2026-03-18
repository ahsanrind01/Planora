import mongoose from "mongoose";

async function connectToMongoDB(){
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
   
    } catch (error) {
        console.error("❌ Error connecting to the database ", error);
    }
}

export default connectToMongoDB;