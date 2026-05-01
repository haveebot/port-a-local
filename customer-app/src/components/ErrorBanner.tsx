import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../lib/theme'; // Assuming theme is available relative to the component

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  variant?: 'inline' | 'fullscreen';
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  variant = 'inline',
}) => {
  const isInline = variant === 'inline';

  const renderRetryChip = () => (
    <TouchableOpacity
      onPress={onRetry}
      style={styles.retryChip}
      accessibilityRole="button"
    >
      <Text style={styles.retryChipText}>Retry</Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (isInline) {
      return (
        <View style={styles.inlineContainer}>
          <Ionicons name="alert-circle-outline" size={24} color={colors.coral[700]} />
          <View style={styles.inlineTextContainer}>
            <Text style={styles.inlineMessage}>{message}</Text>
            {onRetry && <View style={styles.inlineActions}>{renderRetryChip()}</View>}
          </View>
        </View>
      );
    } else {
      // Fullscreen variant
      return (
        <View style={styles.fullscreenContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.coral[700]} />
          <Text style={styles.fullscreenTitle}>Oops! Something went wrong.</Text>
          <Text style={styles.fullscreenMessage}>{message}</Text>
          <View style={styles.fullscreenActions}>
            {onRetry && (
              <TouchableOpacity
                onPress={onRetry}
                style={styles.fullscreenRetryChip}
                accessibilityRole="button"
              >
                <Text style={styles.fullscreenRetryText}>Retry</Text>
              </TouchableOpacity>
            )}
            {/* Assuming a back button or dismiss action is needed for fullscreen */}
            <TouchableOpacity
              onPress={() => console.log('Dismiss')}
              style={styles.fullscreenBackChip}
              accessibilityRole="button"
            >
              <Text style={styles.fullscreenBackText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.coral[100] }]}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  // --- Inline Styles ---
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inlineTextContainer: {
    flex: 1,
  },
  inlineMessage: {
    fontSize: 16,
    color: colors.coral[700],
    fontWeight: '600',
  },
  inlineActions: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 10,
  },
  retryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.coral[600],
  },
  retryChipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // --- Fullscreen Styles ---
  fullscreenContainer: {
    padding: 30,
    alignItems: 'center',
    gap: 20,
  },
  fullscreenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.navy[900],
  },
  fullscreenMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.navy[400],
    marginBottom: 20,
  },
  fullscreenActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 15,
    marginTop: 10,
  },
  fullscreenRetryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.coral[600],
  },
  fullscreenRetryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  fullscreenBackChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.coral[300],
  },
  fullscreenBackText: {
    color: colors.coral[700],
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ErrorBanner;
