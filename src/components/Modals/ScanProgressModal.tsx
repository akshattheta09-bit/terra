// Scan Progress Modal for Terra Media Player

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { ScanProgress } from '../../types/media';
import { Colors } from '../../utils/colors';
import { DIMENSIONS } from '../../utils/constants';

interface ScanProgressModalProps {
  visible: boolean;
  progress: ScanProgress | null;
}

export const ScanProgressModal: React.FC<ScanProgressModalProps> = ({
  visible,
  progress,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={Colors.primary} />
          
          <Text style={styles.title}>Scanning Media</Text>
          
          {progress && (
            <>
              <Text style={styles.currentPath} numberOfLines={1}>
                {progress.currentPath}
              </Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{progress.audioFiles}</Text>
                  <Text style={styles.statLabel}>Audio</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{progress.videoFiles}</Text>
                  <Text style={styles.statLabel}>Video</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{progress.scannedFiles}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
            </>
          )}
          
          <Text style={styles.hint}>
            Please wait while we scan your media files...
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DIMENSIONS.spacing.xl,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.surface,
    borderRadius: DIMENSIONS.borderRadius.lg,
    padding: DIMENSIONS.spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: DIMENSIONS.fontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: DIMENSIONS.spacing.lg,
    marginBottom: DIMENSIONS.spacing.sm,
  },
  currentPath: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: DIMENSIONS.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DIMENSIONS.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.spacing.md,
  },
  statValue: {
    fontSize: DIMENSIONS.fontSize.xxl,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: DIMENSIONS.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.divider,
  },
  hint: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});

export default ScanProgressModal;
