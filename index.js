const express = require("express");
const connectDB = require("./config/Db");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/user", require("./routes/user/userRoutes"));
app.use("/api/manager", require("./routes/manager/managerRoutes"));

app.listen(port, () => console.log(`Server started on port ${port}`));
