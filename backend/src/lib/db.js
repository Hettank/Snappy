import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: "true",
            useUnifiedTopology: "true"
          })
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.log("error connecting db", error)
    }
}