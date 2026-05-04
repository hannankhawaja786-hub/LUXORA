import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    tag: 'DISCOVER',
    title: 'The World',
    titleGold: 'Awaits You',
    subtitle: 'Step into a realm where every\njourney is beyond ordinary',
  },
  {
    id: '2',
    tag: 'EXPERIENCE',
    title: 'One App.',
    titleGold: 'Infinite World.',
    subtitle: 'Flights · Hotels · Dining · AI Planner\nAll curated for the elite traveler',
  },
  {
    id: '3',
    tag: 'LUXORA',
    title: 'You Deserve',
    titleGold: 'Only The Best.',
    subtitle: 'Because luxury is not a privilege —\nit is your standard',
  },
];

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideUp = useRef(new Animated.Value(1)).current;

  const animate = () => {
    slideUp.setValue(0);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    animate();
  }, [currentIndex]);

  const handleNext = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      if (currentIndex < slides.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onDone();
      }
    });
  };

  const slide = slides[currentIndex];

  const translateY = slideUp.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* BG Decorations */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.verticalLine} />

      {/* Skip */}
      <TouchableOpacity style={styles.skipBtn} onPress={onDone}>
        <Text style={styles.skipText}>SKIP</Text>
      </TouchableOpacity>

      {/* Content */}
      <Animated.View style={[
        styles.content,
        { opacity: fadeAnim, transform: [{ translateY }] }
      ]}>
        <View style={styles.tagRow}>
          <View style={styles.tagLine} />
          <Text style={styles.tag}>{slide.tag}</Text>
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.titleGold}>{slide.titleGold}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <View style={styles.progressBar}>
          {slides.map((_, i) => (
            <View key={i} style={styles.progressTrack}>
              <View style={[
                styles.progressFill,
                { backgroundColor: currentIndex >= i ? '#C9A84C' : '#1A1A1A' }
              ]} />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <View style={styles.nextInner}>
            <Text style={styles.nextText}>
              {currentIndex === slides.length - 1 ? 'BEGIN JOURNEY' : 'CONTINUE'}
            </Text>
            <Text style={styles.nextArrow}>→</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.brand}>L · U · X · O · R · A</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  bgCircle1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.05)',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  bgCircle2: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.03)',
    bottom: height * 0.25,
    left: -width * 0.1,
  },
  verticalLine: {
    position: 'absolute',
    left: 32,
    top: height * 0.15,
    width: 1,
    height: height * 0.45,
    backgroundColor: 'rgba(201,168,76,0.2)',
  },
  skipBtn: {
    position: 'absolute',
    top: 55,
    right: 28,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#C9A84C',
    paddingBottom: 2,
  },
  skipText: {
    color: '#C9A84C',
    fontSize: 11,
    letterSpacing: 4,
  },
  content: {
    flex: 1,
    paddingLeft: 60,
    paddingRight: 32,
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  tagLine: {
    width: 24,
    height: 1,
    backgroundColor: '#C9A84C',
    marginRight: 12,
  },
  tag: {
    color: '#C9A84C',
    fontSize: 11,
    letterSpacing: 6,
  },
  title: {
    fontSize: 52,
    color: '#FFFFFF',
    fontWeight: '200',
    letterSpacing: -1,
    lineHeight: 60,
  },
  titleGold: {
    fontSize: 52,
    color: '#C9A84C',
    fontWeight: '300',
    letterSpacing: -1,
    lineHeight: 60,
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  bottom: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,168,76,0.08)',
  },
  progressBar: {
    flexDirection: 'row',
    marginBottom: 28,
    gap: 6,
  },
  progressTrack: {
    flex: 1,
    height: 1,
    backgroundColor: '#1A1A1A',
  },
  progressFill: {
    height: 1,
    width: '100%',
  },
  nextBtn: {
    borderWidth: 1,
    borderColor: '#C9A84C',
    marginBottom: 24,
    backgroundColor: 'rgba(201,168,76,0.05)',
  },
  nextInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 18,
  },
  nextText: {
    color: '#C9A84C',
    fontSize: 12,
    letterSpacing: 5,
    fontWeight: '600',
  },
  nextArrow: {
    color: '#C9A84C',
    fontSize: 18,
  },
  brand: {
    color: '#1E1E1E',
    fontSize: 11,
    letterSpacing: 6,
    textAlign: 'center',
  },
});