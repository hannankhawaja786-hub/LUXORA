import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GROQ_API_KEY = 'key';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface Props {
  onBack: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

function TypingDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.25)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.2, duration: 350, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.25, duration: 350, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.8, duration: 350, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[styles.typingDot, { opacity, transform: [{ scale }] }]} />
  );
}

const QUICK_PROMPTS = [
  { label: 'Plan a 5-Day Luxury Trip', query: 'Design a perfect 5-day luxury Saudi Arabia itinerary for a couple seeking exclusive experiences.' },
  { label: 'AlUla Heritage Experience', query: 'Tell me about AlUla UNESCO heritage private tours and luxury stays.' },
  { label: 'Visa Requirements', query: 'What are the Saudi Arabia visa requirements and entry process for Pakistani passport holders?' },
  { label: 'Top Luxury Hotels', query: 'What are the finest luxury hotels in Riyadh and Jeddah?' },
  { label: 'Desert Safari Guide', query: 'Recommend the best private desert safari experiences in Saudi Arabia.' },
  { label: 'NEOM & Red Sea', query: 'What exclusive experiences are available in NEOM and the Red Sea region?' },
];

const SYSTEM_PROMPT = `You are ARIA — Advanced Route and Itinerary Architect — the elite AI Travel Concierge for LUXORA, Saudi Arabia's most prestigious luxury travel platform.

IDENTITY:
You are sophisticated, warm, knowledgeable, and impeccably refined. You speak with the confidence of a seasoned concierge who has personally experienced every corner of Saudi Arabia.

EXPERTISE:
- All 13 regions of Saudi Arabia: Riyadh, Jeddah, AlUla, NEOM, Abha, Tabuk, Al Khobar, Madinah, Yanbu, Najran, Ha'il, Jazan, Al Qassim
- Ultra-luxury properties: Rosewood AlUla, Banyan Tree AlUla, Four Seasons Riyadh, Ritz-Carlton Jeddah, Park Hyatt Riyadh, Marriott Riyadh
- Visa and entry requirements for all nationalities including e-visa, tourist visa, and visa-on-arrival countries
- Bespoke experiences: private tomb access at Hegra, helicopter tours, desert glamping, Red Sea yacht charters, NEOM expeditions
- VIP airport meet and greet, private jet charters, armored transfers
- Fine dining, private chef services, authentic Saudi cuisine experiences

RESPONSE STYLE:
- Never use emojis under any circumstances
- Keep responses impactful and elegant — concise but rich in value
- Use clear paragraph breaks for longer responses
- Always recommend the finest, most exclusive options first
- Mention specific property names, locations, and price ranges when helpful
- Address the traveler as a distinguished guest
- End responses with a follow-up question when appropriate to continue building the itinerary

IMPORTANT: Respond only about Saudi Arabia travel. If asked about other topics, gracefully redirect to Saudi Arabia experiences.`;

export default function AiTripPlannerScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);

  const headerGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(headerGlow, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(headerGlow, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const avatarGlowOpacity = headerGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.9],
  });

  const getTime = () =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      time: getTime(),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setShowPrompts(false);
    setLoading(true);
    scrollToBottom();

    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 700,
          temperature: 0.7,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...updatedHistory.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg = data?.error?.message ?? JSON.stringify(data);
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: 'assistant',
            content: `Error ${response.status}: ${errMsg}`,
            time: getTime(),
          },
        ]);
        return;
      }

      const replyText =
        data?.choices?.[0]?.message?.content ??
        'I was unable to process your request at this moment. Please try again.';

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: replyText, time: getTime() },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: `Network Error: ${err?.message ?? 'Unknown error'}`,
          time: getTime(),
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setShowPrompts(true);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.avatarWrapper}>
            <Animated.View style={[styles.avatarGlowRing, { opacity: avatarGlowOpacity }]} />
            <View style={styles.avatarCore}>
              <Text style={styles.avatarCoreText}>A</Text>
            </View>
          </View>
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>ARIA</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>LUXORA AI CONCIERGE  ·  ACTIVE</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>CLEAR</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTopBar} />
          <Text style={styles.welcomeEyebrow}>WELCOME TO ARIA</Text>
          <Text style={styles.welcomeHeading}>
            Your Personal Luxury{'\n'}Travel Intelligence
          </Text>
          <Text style={styles.welcomeBody}>
            I specialize exclusively in Saudi Arabia luxury travel. Share your vision, and I will
            architect the perfect journey — from AlUla's ancient wonders to NEOM's futuristic
            frontiers and the pristine Red Sea coast.
          </Text>
          <View style={styles.welcomeDivider} />
          <View style={styles.welcomeStats}>
            {[
              ['13', 'REGIONS'],
              ['500+', 'EXPERIENCES'],
              ['24 / 7', 'CONCIERGE'],
            ].map(([val, lbl]) => (
              <View key={lbl} style={styles.welcomeStat}>
                <Text style={styles.welcomeStatVal}>{val}</Text>
                <Text style={styles.welcomeStatLbl}>{lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        {showPrompts && (
          <View style={styles.promptsBlock}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>START A CONVERSATION</Text>
            </View>
            {QUICK_PROMPTS.map((p) => (
              <TouchableOpacity
                key={p.label}
                onPress={() => sendMessage(p.query)}
                style={styles.promptRow}
                activeOpacity={0.75}
              >
                <View style={styles.promptLeft}>
                  <View style={styles.promptBullet} />
                  <Text style={styles.promptLabel}>{p.label}</Text>
                </View>
                <Text style={styles.promptArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.msgRow,
              msg.role === 'user' ? styles.msgRowUser : styles.msgRowAria,
            ]}
          >
            {msg.role === 'assistant' && (
              <View style={styles.ariaAvatar}>
                <Text style={styles.ariaAvatarText}>A</Text>
              </View>
            )}

            <View
              style={[
                styles.bubble,
                msg.role === 'user' ? styles.bubbleUser : styles.bubbleAria,
              ]}
            >
              {msg.role === 'assistant' && (
                <Text style={styles.bubbleSender}>ARIA  ·  AI CONCIERGE</Text>
              )}
              <Text
                style={[
                  styles.bubbleText,
                  msg.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAria,
                ]}
              >
                {msg.content}
              </Text>
              <Text
                style={[
                  styles.bubbleTime,
                  msg.role === 'user' ? styles.bubbleTimeUser : styles.bubbleTimeAria,
                ]}
              >
                {msg.time}
              </Text>
            </View>

            {msg.role === 'user' && (
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>HK</Text>
              </View>
            )}
          </View>
        ))}

        {loading && (
          <View style={[styles.msgRow, styles.msgRowAria]}>
            <View style={styles.ariaAvatar}>
              <Text style={styles.ariaAvatarText}>A</Text>
            </View>
            <View style={[styles.bubble, styles.bubbleAria]}>
              <Text style={styles.bubbleSender}>ARIA  ·  COMPOSING</Text>
              <View style={styles.dotsRow}>
                <TypingDot delay={0} />
                <TypingDot delay={180} />
                <TypingDot delay={360} />
                <Text style={styles.composingText}>Crafting your itinerary</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask ARIA about your Saudi Arabia journey..."
            placeholderTextColor="#55556A"
            multiline
            maxLength={500}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnOff]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <Text style={[styles.sendIcon, (!input.trim() || loading) && styles.sendIconOff]}>
              ▶
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimer}>
          ARIA  ·  LUXORA Intelligence  ·  Saudi Arabia Specialist
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#C9A84C14',
    backgroundColor: '#0A0A0F',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0E0E15',
    borderWidth: 1,
    borderColor: '#C9A84C30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { color: '#C9A84C', fontSize: 20 },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
    gap: 12,
  },
  avatarWrapper: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  avatarGlowRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#C9A84C',
  },
  avatarCore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F0C040',
  },
  avatarCoreText: { color: '#0A0A0F', fontSize: 16, fontWeight: '900' },
  headerTexts: { justifyContent: 'center' },
  headerTitle: { color: '#C9A84C', fontSize: 16, fontWeight: '900', letterSpacing: 5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50' },
  statusText: { color: '#55556A', fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C9A84C20',
    backgroundColor: '#0E0E15',
  },
  clearBtnText: { color: '#55556A', fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  welcomeCard: {
    backgroundColor: '#0E0E15',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#C9A84C20',
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  welcomeTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#C9A84C',
  },
  welcomeEyebrow: {
    color: '#C9A84C',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 4,
    marginTop: 10,
    marginBottom: 10,
  },
  welcomeHeading: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    letterSpacing: 0.3,
    marginBottom: 14,
  },
  welcomeBody: { color: '#FFFFFF80', fontSize: 12, lineHeight: 20, marginBottom: 20 },
  welcomeDivider: { height: 1, backgroundColor: '#C9A84C14', marginBottom: 20 },
  welcomeStats: { flexDirection: 'row', justifyContent: 'space-around' },
  welcomeStat: { alignItems: 'center' },
  welcomeStatVal: {
    color: '#C9A84C',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  welcomeStatLbl: { color: '#55556A', fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },
  promptsBlock: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionAccent: { width: 3, height: 14, borderRadius: 2, backgroundColor: '#C9A84C' },
  sectionTitle: { color: '#C9A84C', fontSize: 9, fontWeight: '800', letterSpacing: 3 },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E0E15',
    borderWidth: 1,
    borderColor: '#C9A84C14',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    marginBottom: 8,
  },
  promptLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  promptBullet: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#C9A84C' },
  promptLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  promptArrow: { color: '#C9A84C', fontSize: 16, marginLeft: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16, gap: 10 },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAria: { justifyContent: 'flex-start' },
  ariaAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F0C040',
    flexShrink: 0,
  },
  ariaAvatarText: { color: '#0A0A0F', fontSize: 13, fontWeight: '900' },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#13131A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C9A84C40',
    flexShrink: 0,
  },
  userAvatarText: { color: '#C9A84C', fontSize: 10, fontWeight: '800' },
  bubble: { maxWidth: '76%', borderRadius: 18, padding: 14 },
  bubbleUser: { backgroundColor: '#C9A84C', borderBottomRightRadius: 4 },
  bubbleAria: {
    backgroundColor: '#0E0E15',
    borderWidth: 1,
    borderColor: '#C9A84C20',
    borderBottomLeftRadius: 4,
  },
  bubbleSender: { color: '#C9A84C', fontSize: 8, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  bubbleText: { fontSize: 13, lineHeight: 21 },
  bubbleTextUser: { color: '#0A0A0F', fontWeight: '600' },
  bubbleTextAria: { color: '#FFFFFFD0' },
  bubbleTime: { fontSize: 9, marginTop: 8 },
  bubbleTimeUser: { color: '#0A0A0F50', textAlign: 'right' },
  bubbleTimeAria: { color: '#55556A' },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C9A84C' },
  composingText: { color: '#55556A', fontSize: 10, marginLeft: 6, fontStyle: 'italic' },
  inputBar: {
    backgroundColor: '#0A0A0F',
    borderTopWidth: 1,
    borderTopColor: '#C9A84C14',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 8 },
  textInput: {
    flex: 1,
    backgroundColor: '#0E0E15',
    borderWidth: 1,
    borderColor: '#C9A84C30',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 20,
    maxHeight: 120,
  },
  sendBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F0C040',
  },
  sendBtnOff: { backgroundColor: '#0E0E15', borderColor: '#C9A84C20' },
  sendIcon: { color: '#0A0A0F', fontSize: 14, fontWeight: '900' },
  sendIconOff: { color: '#C9A84C40' },
  disclaimer: {
    color: '#2A2A3A',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 2,
  },
});