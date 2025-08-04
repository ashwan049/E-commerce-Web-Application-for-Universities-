import mongoose from "mongoose";
import express, { Router } from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import { GetUniversities } from "./controllers/UniversityController.js";
import router from "./routes/staticRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Allow your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));



// app.use("/",authMiddleware,router);
app.use("/",router);
 

app.use(express.static("public/universityImg/"))
app.use(express.static("public/departmentImg"));
app.use(express.static("public/productImg"));
app.use(express.static("public/userImg"));




mongoose.connect(process.env.DB_URL).then((d) => {
  console.log("database Connected");

  app.listen(process.env.PORT, () => {
    console.log("server started at http://localhost:" + process.env.PORT)
  });
}).catch((e) => {
  console.log(e);
});
