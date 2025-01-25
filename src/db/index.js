import mongoose from "mongoose";
import { DbName } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionResponse = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DbName}`
    );
    console.log('Success : DB connected successfully at',connectionResponse.connection.host);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default connectDB;
