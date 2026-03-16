import eventBus from '../utils/eventBus.js';
import sgMail from '@sendgrid/mail';
import { Expo } from 'expo-server-sdk';


const expo = new Expo();


eventBus.on('bookingCreated', async (bookingData) => {
    console.log(`\n🎧 [Event Bus] Heard 'bookingCreated' for Booking ID: ${bookingData._id}`);
    

    sendRealEmail(bookingData.userEmail, bookingData.userName, bookingData.businessName, bookingData.date);

    if (bookingData.pushToken) {
        sendRealNotification(bookingData.pushToken, bookingData.businessName);
    } else {
        console.log(`🔕 [Push Worker] Skipped: No push token found for user.`);
    }
});

const sendRealEmail = async (email, userName, businessName, date) => {
    try {

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
            to: email, 
            from: process.env.SENDGRID_FROM_EMAIL, 
            subject: 'Appointment Confirmed! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>You're all set, ${userName.split(' ')[0]}!</h2>
                    <p>Your appointment at <strong>${businessName}</strong> is officially confirmed.</p>
                    <p>📅 <strong>Date:</strong> ${new Date(date).toDateString()}</p>
                    <br/>
                    <p>See you soon!</p>
                </div>
            `,
        };

        await sgMail.send(msg);
        console.log(`✉️  [Email Worker] SUCCESS: Receipt sent to ${email}`);
    } catch (error) {
        console.error("🚨 [Email Worker] ERROR:", error.response?.body || error.message);
    }
};

const sendRealNotification = async (pushToken, businessName) => {
    try {
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`🚨 [Push Worker] ERROR: Invalid Expo push token ${pushToken}`);
            return;
        }

        const messages = [{
            to: pushToken,
            sound: 'default',
            title: 'Appointment Confirmed! ✅',
            body: `Your booking at ${businessName} is locked in.`,
            data: { type: 'booking_confirmation' }, 
        }];

        let ticketChunks = await expo.sendPushNotificationsAsync(messages);
        console.log(`📱 [Push Worker] SUCCESS: Notification beamed to phone!`);

    } catch (error) {
        console.error("🚨 [Push Worker] ERROR:", error);
    }
};