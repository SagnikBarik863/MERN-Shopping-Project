import Razorpay from "razorpay";

// Created lazily so the server can still start (and the other labs work)
// even if Razorpay keys have not been added to .env yet.
let instance = null;

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env");
  }

  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return instance;
};

export default getRazorpay;
