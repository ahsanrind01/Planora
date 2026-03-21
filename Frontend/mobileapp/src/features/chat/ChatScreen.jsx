import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    KeyboardAvoidingView, 
    Platform, 
    StyleSheet,
    SafeAreaView,
    StatusBar
} from 'react-native';

import { ChevronLeft, Send, CheckCheck } from 'lucide-react-native';
import { io } from 'socket.io-client';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; 

import { apiClient } from '../../core/api/apiClient'; 
import { useAuthStore } from '../../core/store/authStore';
import { BASE_URL } from '../../core/config'; 

export default function ChatScreen() {
    const route = useRoute();
    const navigation = useNavigation(); 
    const { conversationId, receiverName } = route.params; 
    const currentUser = useAuthStore(state => state.user);
    
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const socketRef = useRef(null);
    const flatListRef = useRef(null);

   useEffect(() => {
        fetchMessages();
        
        apiClient.put(`/chat/${conversationId}/read`).catch(err => console.log("Read Error:", err));

        socketRef.current = io(BASE_URL, {
            transports: ['websocket'],
            forceNew: true 
        });

        socketRef.current.emit('joinRoom', String(conversationId));

        socketRef.current.on('receiveMessage', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            scrollToBottom();
            
            const rawSenderId = newMessage.senderId?._id || newMessage.senderId;
            if (String(rawSenderId) !== String(currentUser?._id)) {
                apiClient.put(`/chat/${conversationId}/read`).catch(err => console.log(err));
            }
        });

        socketRef.current.on('messagesRead', ({ readerId }) => {
            
            setMessages((prev) => prev.map(msg => {
                const rawSenderId = msg.senderId?._id || msg.senderId;
                
                if (String(rawSenderId) !== String(readerId)) {
                    return { ...msg, isRead: true }; 
                }
                return msg;
            }));
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);
    
    const fetchMessages = async () => {
        try {
            const response = await apiClient.get(`/chat/${conversationId}/messages`);
            setMessages(response.data.data);
            scrollToBottom();
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const textToSend = inputText;
        setInputText(""); 

        try {
            await apiClient.post('/chat/send', {
                conversationId,
                text: textToSend,
                receiverId: route.params.receiverId 
            });
        } catch (error) {
            console.error("Failed to send:", error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item }) => {
        const rawSenderId = item.senderId?._id || item.senderId;
        const myId = currentUser?._id || currentUser?.id;
        const isMe = String(rawSenderId) === String(myId);

        return (
            <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
                <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
                    <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                        {item.text}
                    </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginHorizontal: 4 }}>
                    <Text style={styles.timestampText}>{formatTime(item.createdAt)}</Text>
                    {isMe && (
                        <CheckCheck 
                            size={14} 
                            color={item.isRead ? '#3b82f6' : '#94a3b8'} 
                            style={{ marginLeft: 4 }} 
                        />
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <ChevronLeft color="#1e293b" size={28} />
                    </TouchableOpacity>
                    
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>{receiverName || "Chat"}</Text>
                        <Text style={styles.headerSubtitle}>Active now</Text>
                    </View>
                    <View style={{ width: 40 }} /> 
                </View>

                <LinearGradient 
                    colors={['#f8fafc', '#eff6ff', '#dbeafe']} 
                    style={styles.chatBackground}
                >
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item._id}
                        renderItem={renderMessage}
                        contentContainerStyle={styles.listContainer}
                        onContentSizeChange={scrollToBottom}
                        showsVerticalScrollIndicator={false}
                    />
                </LinearGradient>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Message..."
                        placeholderTextColor="#94a3b8"
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={sendMessage}
                        multiline={true}
                    />
                    <TouchableOpacity 
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
                        onPress={sendMessage}
                        disabled={!inputText.trim()}
                        activeOpacity={0.8}
                    >
                        <Send color="#fff" size={18} style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: '#fff' 
    },
    container: { 
        flex: 1, 
        backgroundColor: '#fff' 
    },
    header: { 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12, 
        backgroundColor: '#fff', 
        borderBottomWidth: 1, 
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 5,
        zIndex: 10
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitleContainer: {
        alignItems: 'center'
    },
    headerTitle: { 
        fontSize: 18, 
        fontWeight: '700', 
        color: '#0f172a' 
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#10b981', 
        fontWeight: '600',
        marginTop: 2
    },
    chatBackground: {
        flex: 1, 
    },
    listContainer: { 
        padding: 15, 
        paddingBottom: 25 
    },
    messageWrapper: {
        marginBottom: 16,
    },
    myMessageWrapper: {
        alignItems: 'flex-end',
    },
    theirMessageWrapper: {
        alignItems: 'flex-start',
    },
    messageBubble: { 
        maxWidth: '78%', 
        paddingHorizontal: 16,
        paddingVertical: 12, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
    },
    myMessage: { 
        backgroundColor: '#2563eb', 
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 4, 
    },
    theirMessage: { 
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 4, 
        borderWidth: 1,
        borderColor: '#e2e8f0' 
    },
    messageText: { 
        fontSize: 15.5,
        lineHeight: 22
    },
    myMessageText: { 
        color: '#ffffff' 
    },
    theirMessageText: { 
        color: '#334155' 
    },
    timestampText: {
        fontSize: 11,
        color: '#64748b', 
        marginTop: 4,
        marginHorizontal: 4,
        fontWeight: '500'
    },
    inputContainer: { 
        flexDirection: 'row', 
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#ffffff', 
        borderTopWidth: 1, 
        borderColor: '#f1f5f9', 
        alignItems: 'flex-end', 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 10,
    },
    input: { 
        flex: 1, 
        backgroundColor: '#f1f5f9', 
        paddingHorizontal: 20, 
        paddingTop: 12, 
        paddingBottom: 12,
        borderRadius: 24, 
        fontSize: 15, 
        marginRight: 12,
        maxHeight: 120, 
        color: '#0f172a'
    },
    sendButton: { 
        backgroundColor: '#2563eb', 
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2 
    },
    sendButtonDisabled: {
        backgroundColor: '#93c5fd', 
    }
});