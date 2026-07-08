const mongoose = require('mongoose');

const connectDB = async () =>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connection Suceesfully");
    }
    catch(error){
        console.error("MongoDB Connection Faild");
        console.error(error.message)

        process.exit(1);
    }
    
};

module.exports = connectDB;