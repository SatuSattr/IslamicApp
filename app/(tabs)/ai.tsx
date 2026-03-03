import { useScrollDirection } from "@/contexts/scroll-context";
import { generateIslamicResponse } from "@/scripts/ai-service";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai" | "system";
  timestamp: Date;
};

const SUGGESTED_PROMPTS = [
  "Apa itu puasa Ramadhan?",
  "Bagaimana cara shalat sunnah?",
  "Berikan doa untuk orang tua",
  "Kisah singkat Nabi Muhammad SAW",
];

export default function AIScreen() {
  const insets = useSafeAreaInsets();
  const { handleScroll, isScrollingDown } = useScrollDirection();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Animation for input container position
  const translateY = useSharedValue(0);

  useEffect(() => {
    // 80 is the height we lift the input to clear the tab bar
    // We move it most of the way down when tab bar hides
    translateY.value = withTiming(isScrollingDown ? 75 : 0, {
      duration: 350,
      easing: Easing.inOut(Easing.ease),
    });
  }, [isScrollingDown, translateY]);

  const animatedInputStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSend = async (text?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim() || isLoading) return;

    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      text: messageText.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    if (!text) setInputText("");
    setIsLoading(true);

    try {
      // Prepare history for API (filter out system/error messages)
      const history = messages
        .filter((m) => m.sender !== "system")
        .map((m) => ({
          role: (m.sender === "user" ? "user" : "assistant") as
            | "user"
            | "assistant",
          content: m.text,
        }));

      const aiText = await generateIslamicResponse(messageText.trim(), history);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi nanti.",
        sender: "system",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    setMessages([]);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageWrapper,
        item.sender === "user"
          ? styles.userMessageWrapper
          : styles.aiMessageWrapper,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.sender === "user"
            ? styles.userBubble
            : item.sender === "ai"
            ? styles.aiBubble
            : styles.systemBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.sender === "user"
              ? styles.userMessageText
              : item.sender === "ai"
              ? styles.aiMessageText
              : styles.systemMessageText,
          ]}
        >
          {item.text}
        </Text>
      </View>
      <Text style={styles.timestampText}>
        {item.timestamp.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.aiIconCircle}>
        <MaterialIcons name="auto-awesome" size={40} color="#6F8F72" />
      </View>
      <Text style={styles.emptyTitle}>Tanya Islamic AI</Text>
      <Text style={styles.emptySubtitle}>
        Tanyakan apa saja seputar Islam, hukum fiqih, atau doa harian.
      </Text>

      <View style={styles.suggestionsGrid}>
        {SUGGESTED_PROMPTS.map((prompt, index) => (
          <Pressable
            key={index}
            style={styles.suggestionChip}
            onPress={() => handleSend(prompt)}
          >
            <Text style={styles.suggestionText}>{prompt}</Text>
            <MaterialIcons name="north-east" size={14} color="#6F8F72" />
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="auto-awesome" size={28} color="#6F8F72" />
            <Text style={styles.headerTitle}>AI Assistant</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.headerBtn,
              messages.length === 0 && { opacity: 0.3 },
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleClearChat}
            disabled={messages.length === 0}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="delete-sweep" size={26} color="#666" />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.chatContent,
          messages.length === 0 && { flex: 1, justifyContent: "center" },
        ]}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={() =>
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#6F8F72" />
              <Text style={styles.loadingText}>
                Islamic AI sedang mengetik...
              </Text>
            </View>
          ) : null
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <Animated.View
        style={[
          styles.inputContainer,
          { paddingBottom: insets.bottom + 80 },
          animatedInputStyle,
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            isLoading && styles.inputWrapperDisabled,
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder={
              isLoading
                ? "Sedang menunggu respon..."
                : "Ketik pertanyaan Anda..."
            }
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isLoading}
          />
          <Pressable
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="send" size={24} color="#fff" />
            )}
          </Pressable>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    paddingHorizontal: 20,
    backgroundColor: "#fafafa",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  chatContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  /* --- Message Styles --- */
  messageWrapper: {
    marginBottom: 16,
    maxWidth: "85%",
  },
  userMessageWrapper: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  aiMessageWrapper: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderCurve: "continuous",
  },
  userBubble: {
    backgroundColor: "#6F8F72",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "#f0f4f1",
    borderBottomLeftRadius: 4,
  },
  systemBubble: {
    backgroundColor: "#fdeced",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#f8d7da",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#fff",
  },
  aiMessageText: {
    color: "#1a1a1a",
  },
  systemMessageText: {
    color: "#721c24",
    fontSize: 13,
  },
  timestampText: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 4,
    marginHorizontal: 4,
  },
  /* --- Empty State --- */
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  aiIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f4f1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  suggestionsGrid: {
    width: "100%",
    gap: 12,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  suggestionText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },
  /* --- Input Area --- */
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#fafafa",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#eee",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1a1a1a",
    paddingVertical: 8,
    maxHeight: 100,
    textAlignVertical: "center",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6F8F72",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  loadingText: {
    fontSize: 12,
    color: "#6F8F72",
    fontStyle: "italic",
  },
  inputWrapperDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#eee",
  },
});
