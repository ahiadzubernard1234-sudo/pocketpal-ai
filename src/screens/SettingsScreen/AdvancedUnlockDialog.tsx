import React, {useEffect, useState} from 'react';
import {Modal, Pressable, StyleSheet, TextInput, View} from 'react-native';

import {Button, Text} from 'react-native-paper';

import {useTheme} from '../../hooks';

// Simple access code that keeps the advanced model settings out of casual reach.
// This is a convenience guard, not security: the code ships inside the app bundle.
export const ADVANCED_SETTINGS_CODE = '0000';

interface AdvancedUnlockDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onUnlock: () => void;
}

export const AdvancedUnlockDialog: React.FC<AdvancedUnlockDialogProps> = ({
  visible,
  onDismiss,
  onUnlock,
}) => {
  const theme = useTheme();
  const [code, setCode] = useState('');
  const [hasError, setHasError] = useState(false);

  // Start clean every time the dialog opens.
  useEffect(() => {
    if (visible) {
      setCode('');
      setHasError(false);
    }
  }, [visible]);

  const submit = () => {
    if (code === ADVANCED_SETTINGS_CODE) {
      setCode('');
      setHasError(false);
      onUnlock();
    } else {
      setHasError(true);
      setCode('');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        {/* Inner Pressable swallows taps so touching the card doesn't dismiss */}
        <Pressable
          style={[styles.card, {backgroundColor: theme.colors.surface}]}
          onPress={() => {}}>
          <Text variant="titleMedium" style={{color: theme.colors.onSurface}}>
            Advanced settings
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.description, {color: theme.colors.onSurface}]}>
            Enter the access code to change advanced model settings.
          </Text>
          <TextInput
            testID="advanced-unlock-input"
            value={code}
            onChangeText={text => {
              setCode(text.replace(/[^0-9]/g, ''));
              setHasError(false);
            }}
            onSubmitEditing={submit}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            autoFocus
            placeholder="Access code"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={[
              styles.input,
              {
                color: theme.colors.onSurface,
                borderColor: hasError
                  ? theme.colors.error
                  : theme.colors.outline,
              },
            ]}
          />
          {hasError && (
            <Text
              variant="labelSmall"
              testID="advanced-unlock-error"
              style={{color: theme.colors.error}}>
              Incorrect code. Try again.
            </Text>
          )}
          <View style={styles.actions}>
            <Button onPress={onDismiss} testID="advanced-unlock-cancel">
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={submit}
              testID="advanced-unlock-submit">
              Unlock
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  description: {
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    letterSpacing: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
});
