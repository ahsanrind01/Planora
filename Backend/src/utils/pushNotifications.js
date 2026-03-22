import { Expo } from 'expo-server-sdk';

let expo = new Expo();

export const sendPushNotification = async (pushToken, title, body, data = {}) => {
    if (!Expo.isExpoPushToken(pushToken)) {
        return;
    }

    const messages = [{
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
    }];

    try {
        let ticketChunk = await expo.sendPushNotificationsAsync(messages);
    } catch (error) {
    }
};