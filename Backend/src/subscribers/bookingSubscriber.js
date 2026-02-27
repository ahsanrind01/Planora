import eventBus from '../utils/eventBus.js';

eventBus.on('bookingCreated', async (bookingData) => {
    console.log(`\n🎧 [Event Bus] Heard 'bookingCreated' for Booking ID: ${bookingData._id}`);
    
    simulateEmailPush(bookingData.userEmail, 'Your booking is confirmed!');

    simulateNotificationPush(bookingData.businessId, 'You have a new appointment!');
});


const simulateEmailPush = async (email, message) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`✉️  [Email Worker] Successfully sent to ${email}: "${message}"`);
            resolve();
        }, 2000); 
    });
};

const simulateNotificationPush = async (businessId, message) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`📱 [Push Worker] Notification sent to Business ${businessId}: "${message}"`);
            resolve();
        }, 1000); 
    });
};