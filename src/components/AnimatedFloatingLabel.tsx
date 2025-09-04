import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, HelperText } from 'react-native-paper';
import { MotiView } from 'moti';
import { tokens } from '../theme/tokens';

interface AnimatedFloatingLabelProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  maxLength?: number;
  style?: any;
}

export const AnimatedFloatingLabel: React.FC<AnimatedFloatingLabelProps> = ({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  maxLength,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const shouldFloat = isFocused || hasValue;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <MotiView
          style={styles.labelContainer}
          animate={{
            translateY: shouldFloat ? -8 : 0,
            scale: shouldFloat ? 0.75 : 1,
          }}
          transition={{
            type: 'timing',
            duration: 200,
          }}
        >
          <Text
            style={[
              styles.label,
              {
                color: error
                  ? tokens.colors.error
                  : shouldFloat && isFocused
                  ? tokens.colors.primary
                  : tokens.colors.onSurface38,
              },
            ]}
          >
            {label}
          </Text>
        </MotiView>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          maxLength={maxLength}
          style={[styles.input, multiline && styles.multilineInput]}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          theme={{
            colors: {
              primary: tokens.colors.primary,
              background: 'transparent',
              onSurfaceVariant: tokens.colors.onSurface60,
            },
          }}
        />

        {!multiline && (
          <>
            <MotiView
              style={styles.underline}
              animate={{
                scaleX: isFocused ? 1 : 0,
                backgroundColor: error ? tokens.colors.error : tokens.colors.primary,
              }}
              transition={{
                type: 'timing',
                duration: 200,
              }}
            />
            
            <View style={[styles.underlineBase, error && { backgroundColor: tokens.colors.error }]} />
          </>
        )}
      </View>

      {error && (
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        </MotiView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: tokens.spacing.s,
  },
  inputContainer: {
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    left: tokens.spacing.m,
    top: tokens.spacing.m,
    zIndex: 1,
    backgroundColor: tokens.colors.bg,
    paddingHorizontal: 4,
  },
  label: {
    ...tokens.typography.body,
  },
  input: {
    backgroundColor: 'transparent',
    paddingTop: tokens.spacing.l,
  },
  multilineInput: {
    minHeight: 48,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    transformOrigin: 'center',
  },
  underlineBase: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: tokens.colors.onSurface38,
  },
});
