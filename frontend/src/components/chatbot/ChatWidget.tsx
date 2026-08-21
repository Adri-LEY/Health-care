import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import styles from './ChatWidget.module.css';

interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
}

export const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            sender: 'bot',
            text: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
            timestamp: new Date(Date.now() - 5 * 60000),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize new chat when widget opens
    useEffect(() => {
        if (isOpen) {
            initializeNewChat();
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initializeNewChat = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/chatbot/new-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                console.error('Failed to initialize new chat');
            }
        } catch (error) {
            console.error('Error initializing new chat:', error);
        }
    };

    const handleResetChat = async () => {
        // Reset messages to initial state
        setMessages([
            {
                id: '1',
                sender: 'bot',
                text: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
                timestamp: new Date(),
            },
        ]);
        setInputValue('');
        // Call backend to create new chat session
        await initializeNewChat();
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) {
            return;
        }

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: inputValue,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // Simulation d'une réponse du bot avec délai
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/chatbot/send-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ message: userMessage.text }),
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
            }
            const data = await response.json();
            const botResponse : ChatMessage = {
                id: Date.now().toString() + '-bot',
                sender: 'bot',
                text: data.response || 'Une erreur est survenue. Veuillez réessayer.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botResponse]);
            setIsLoading(false);
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message :', error);
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={styles.chatContainer}>
            {/* Bouton flottant */}
            <button
                className={styles.floatingButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Ouvrir le chat"
                aria-expanded={isOpen}
            >
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <MessageCircle size={24} />
                )}
            </button>

            {/* Fenêtre du chat */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    {/* Header */}
                    <div className={styles.chatHeader}>
                        <h3>Assistant Clinique</h3>
                        <div className={styles.headerActions}>
                            <button
                                className={styles.resetButton}
                                onClick={handleResetChat}
                                aria-label="Réinitialiser le chat"
                                title="Commencer une nouvelle conversation"
                            >
                                ↻
                            </button>
                            <button
                                className={styles.closeButton}
                                onClick={() => setIsOpen(false)}
                                aria-label="Fermer le chat"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className={styles.messagesContainer}>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`${styles.message} ${styles[message.sender]}`}
                            >
                                <div className={styles.messageContent}>
                                    <p>{message.text}</p>
                                    <span className={styles.timestamp}>
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className={`${styles.message} ${styles.bot}`}>
                                <div className={styles.messageContent}>
                                    <div className={styles.typingIndicator}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className={styles.inputContainer}>
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Tapez votre message..."
                            className={styles.inputField}
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            className={styles.sendButton}
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            aria-label="Envoyer le message"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
