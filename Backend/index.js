import dotenv from 'dotenv'
dotenv.config();

import express from 'express'
import connectToMongoDB from './src/config/database.js'
import authRoutes from './src/routes/auth.js'
import userRoutes from './src/routes/user.js'


connectToMongoDB();
console.log("connected to the database");
const app = express();

app.use(express.json())

app.use('/api/auth' ,authRoutes)
app.use('/api/users' ,userRoutes)



app.listen(3000,()=>console.log('server running on port 3000'));