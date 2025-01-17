require('dotenv').config()
const express=require('express')
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const router = require('./router/router')
const cors=require('cors')
const errorMiddleware=require('./middleware/error-middleware')

const app=express()
const PORT=5000

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials:true,
    origin: process.env.CLIENT_URL
}))
app.use('/api', router)
app.use(errorMiddleware)

const startApp = async() =>{
    try {
        await mongoose.connect(process.env.MONGO_CONNECTION)
        app.listen(PORT, ()=> {
            console.log(`server start on ${PORT}`)
        })
    }
   catch (e) {
       console.log(e)
   }
}

startApp()