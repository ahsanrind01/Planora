import mongoose from "mongoose";
 async function connectToMongoDB(){
    try {
           await mongoose.connect('mongodb://localhost:27017/Planora');
   
    } catch (error) {
        console.error("error connecting to the database ",error);
    }
}

export default connectToMongoDB