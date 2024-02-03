const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);


const initiateCall = async (phoneNumber, message) => {
  try {
    const call = await client.calls.create({
      to: phoneNumber,
      from: "+12673968428",
      twiml: `<Response><Say>${message}</Say></Response>`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallback:
        "https://4faf-157-34-121-143.ngrok-free.app/callback",
    });

    return call.sid;
  } catch (error) {
    console.error("Error making Twilio voice call:", error);
  }
};

module.exports = initiateCall;
