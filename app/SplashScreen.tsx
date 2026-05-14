import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Props {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      ]),
      Animated.timing(lineAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => onDone(), 800);
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.bgOverlay} />
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.crownIcon}>♛</Text>
        <Text style={styles.brandName}>LUXORA</Text>
        <Animated.View style={[styles.goldLine, { opacity: lineAnim, transform: [{ scaleX: lineAnim }] }]} />
        <Animated.Text style={[styles.tagline, { opacity: lineAnim }]}>
          Where Luxury Meets Journey
        </Animated.Text>
      </Animated.View>
      <Animated.Text style={[styles.bottomText, { opacity: fadeAnim }]}>
        BY HANNAN KHAWAJA
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' },
  bgOverlay: { position: 'absolute', width, height, backgroundColor: '#0A0A0F' },
  logoContainer: { alignItems: 'center', justifyContent: 'center' },
  crownIcon: { fontSize: 60, color: '#C9A84C', marginBottom: 16, textShadowColor: '#F0C040', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  brandName: { fontSize: 52, fontWeight: '300', color: '#C9A84C', letterSpacing: 18, textShadowColor: '#F0C040', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 },
  goldLine: { width: 200, height: 1, backgroundColor: '#C9A84C', marginVertical: 20 },
  tagline: { fontSize: 13, color: '#F0C040', letterSpacing: 4, fontWeight: '300' },
  bottomText: { position: 'absolute', bottom: 50, fontSize: 11, color: '#C9A84C', letterSpacing: 6, opacity: 0.7 },
});