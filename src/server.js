require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");

const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| Connect Database
|--------------------------------------------------------------------------
*/

connectDatabase();

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {

    console.log("--------------------------------");
    console.log(`Server Running on Port ${PORT}`);
    console.log(`Environment : ${process.env.NODE_ENV}`);
    console.log("--------------------------------");

});