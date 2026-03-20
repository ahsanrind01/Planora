import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { apiClient } from '../../core/api/apiClient'; 

import { useAppointmentStore } from '../../core/store/appointmentStore';

export default function CheckoutScreen() {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const route = useRoute();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    const { 
        serviceId,
        finalDateString,
        businessName = "Test Barbershop", 
        serviceName = "Premium Haircut", 
        price = 50, 
        selectedTime = "Friday at 2:00 PM" 
    } = route.params || {};

    const platformFee = 2;
    const finalTotal = price + platformFee;

    const handlePayment = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post('/payments/create-payment-intent', {
                amount: finalTotal * 100, 
            });
            
            const { clientSecret , paymentIntentId} = response.data;

            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: 'Planora',
                paymentIntentClientSecret: clientSecret,
                allowsDelayedPaymentMethods: false,
                returnURL: 'planora://stripe-redirect',
                defaultBillingDetails: {
                    name: 'Test User', 
                }
            });

            if (initError) {
                Alert.alert("Error", initError.message);
                setLoading(false);
                return;
            }

            const { error: paymentError } = await presentPaymentSheet();

            if (paymentError) {
                if (paymentError.code !== 'Canceled') {
                    Alert.alert("Payment Failed", paymentError.message);
                }
            } else {                
                const { submitBooking } = useAppointmentStore.getState();
                
                const result = await submitBooking(serviceId, finalDateString, selectedTime, 'paid', paymentIntentId);

               if (result.success) {
                    Alert.alert(
                        "The business has received your booking request. If they decline or cannot fit you in, your payment will be automatically refunded."
                    );
                    
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'CustomerApp' }],
                    });
                } else {
                    Alert.alert("Warning", "Payment succeeded, but booking failed to save. Please contact support.");
                }
            }

        } catch (error) {
            console.error("Payment API Error:", error);
            Alert.alert("Error", "Could not connect to payment server.");
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Confirm & Pay</Text>

            <View style={styles.summaryCard}>
                <Text style={styles.businessName}>{businessName}</Text>
                <Text style={styles.detailText}>{serviceName}</Text>
                <Text style={styles.detailText}>{selectedTime}</Text>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Text style={styles.priceText}>Service Price</Text>
                    <Text style={styles.priceText}>${price.toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.priceText}>Platform Fee</Text>
                    <Text style={styles.priceText}>${platformFee.toFixed(2)}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Text style={styles.totalText}>Total</Text>
                    <Text style={styles.totalText}>${finalTotal.toFixed(2)}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.trustText}>
                    🔒 Your payment is securely held. You will be automatically refunded if the manager declines this request.
                </Text>

                <TouchableOpacity 
                    style={[styles.payButton, loading && styles.payButtonDisabled]} 
                    onPress={handlePayment}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.payButtonText}>Pay ${finalTotal.toFixed(2)}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
    header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
    summaryCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    businessName: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    detailText: { fontSize: 16, color: '#555', marginBottom: 5 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    priceText: { fontSize: 16, color: '#333' },
    totalText: { fontSize: 18, fontWeight: 'bold' },
    footer: { position: 'absolute', bottom: 40, left: 20, right: 20 },
    payButton: { backgroundColor: '#000', paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
    payButtonDisabled: { backgroundColor: '#555' },
    payButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    trustText: { 
        textAlign: 'center', 
        color: '#64748b', 
        fontSize: 12, 
        marginBottom: 12, 
        paddingHorizontal: 10 
    },
});