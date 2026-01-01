// Search Bar Component for Terra Media Player

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Keyboard,
} from 'react-native';
import { Colors } from '../../utils/colors';
import { DIMENSIONS } from '../../utils/constants';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  showClearButton?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder = 'Search...',
  autoFocus = false,
  showClearButton = true,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const borderAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = borderAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.primary],
  });

  const handleClear = () => {
    onChangeText('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    onSubmit?.();
  };

  return (
    <Animated.View style={[styles.container, { borderColor }]}>
      <View style={styles.searchIcon}>
        <Text style={styles.iconText}>🔍</Text>
      </View>
      
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        autoFocus={autoFocus}
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      {showClearButton && value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          activeOpacity={0.7}
        >
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// Text component for icons
const Text = ({ style, children }: { style?: any; children: React.ReactNode }) => (
  <Animated.Text style={style}>{children}</Animated.Text>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: DIMENSIONS.searchBar,
    backgroundColor: Colors.surfaceLight,
    borderRadius: DIMENSIONS.borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: DIMENSIONS.spacing.md,
  },
  searchIcon: {
    marginRight: DIMENSIONS.spacing.sm,
  },
  iconText: {
    fontSize: DIMENSIONS.fontSize.lg,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: DIMENSIONS.fontSize.md,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: DIMENSIONS.spacing.sm,
  },
  clearText: {
    fontSize: DIMENSIONS.fontSize.md,
    color: Colors.textSecondary,
  },
});

export default SearchBar;
