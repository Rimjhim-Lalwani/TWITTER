import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileProfile: { type: String },
    followers: { type: Array, defaultValue: [] },
    following: { type: Array, defaultValue: [] },
    description: { type: String },
    profilePicture: { type: String },
    banner: { type: String },
    createdAt:{type: Date,
      default: Date.now,
      get: (createdAt) => {
        const date = new Date(createdAt);
        return {
          day: date.getDate(),
          month: date.toLocaleString("default", { month: "long" }),
          year: date.getFullYear(), 
        };
      },
    },
  
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);