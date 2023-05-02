import { connect, set } from 'mongoose';

const connectDb = async () => {
  set("strictQuery", true);
  const conn = await connect(process.env.MONGO_URI!);

  console.log("MongoDB Connected: " + conn.connection.host);
};

export { connectDb }