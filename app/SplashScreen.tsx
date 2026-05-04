import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(lineAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.bgOverlay} />

      {/* Logo Area */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Crown Icon */}
        <Text style={styles.crownIcon}>♛</Text>

        {/* Brand Name */}
        <Text style={styles.brandName}>LUXORA</Text>

        {/* Gold Line */}
        <Animated.View
          style={[
            styles.goldLine,
            {
              opacity: lineAnim,
              transform: [{ scaleX: lineAnim }],
            },
          ]}
        />

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: lineAnim }]}>
          Where Luxury Meets Journey
        </Animated.Text>
      </Animated.View>

      {/* Bottom Text */}
      <Animated.Text style={[styles.bottomText, { opacity: fadeAnim }]}>
        BY HANNAN KHAWAJA
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgOverlay: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: '#0A0A0F',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownIcon: {
    fontSize: 60,
    color: '#C9A84C',
    marginBottom: 16,
    textShadowColor: '#F0C040',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  brandName: {
    fontSize: 52,
    fontWeight: '300',
    color: '#C9A84C',
    letterSpacing: 18,
    textShadowColor: '#F0C040',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  goldLine: {
    width: 200,
    height: 1,
    backgroundColor: '#C9A84C',
    marginVertical: 20,
  },
  tagline: {
    fontSize: 13,
    color: '#F0C040',
    letterSpacing: 4,
    fontWeight: '300',
  },
  bottomText: {
    position: 'absolute',
    bottom: 50,
    fontSize: 11,
    color: '#C9A84C',
    letterSpacing: 6,
    opacity: 0.7,
  },
});