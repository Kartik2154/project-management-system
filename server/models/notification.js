import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    receiverType: {
      type: String,
      enum: ["admin", "guide", "student"],
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "receiverType", // Dynamic reference!
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
