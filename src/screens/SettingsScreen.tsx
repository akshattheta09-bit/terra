// Settings Screen for Terra Media Player

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { useMediaScanning } from '../hooks/useMediaScanning';
import {
  updateAudioSettings,
  updateVideoSettings,
  updateLibrarySettings,
  updateAppearanceSettings,
  resetSettings,
} from '../store';
import { Header, ScanProgressModal } from '../components';
import { Colors } from '../utils/colors';
import { DIMENSIONS, APP_VERSION } from '../utils/constants';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

interface SettingsRowProps {
  title: string;
  subtitle?: string;
  value?: React.ReactNode;
  onPress?: () => void;
  showArrow?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  title,
  subtitle,
  value,
  onPress,
  showArrow = false,
}) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.rowLeft}>
      <Text style={styles.rowTitle}>{title}</Text>
      {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
    </View>
    <View style={styles.rowRight}>
      {value}
      {showArrow && <Text style={styles.arrow}>›</Text>}
    </View>
  </TouchableOpacity>
);

interface SettingsSwitchRowProps {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const SettingsSwitchRow: React.FC<SettingsSwitchRowProps> = ({
  title,
  subtitle,
  value,
  onValueChange,
}) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <Text style={styles.rowTitle}>{title}</Text>
      {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: Colors.surfaceLight, true: Colors.primary + '80' }}
      thumbColor={value ? Colors.primary : Colors.textSecondary}
    />
  </View>
);

export const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector(state => state.settings);
  const { isScanning, scanProgress } = useAppSelector(state => state.ui);
  const { allSongs } = useAppSelector(state => state.audio);
  const { allVideos } = useAppSelector(state => state.video);
  
  const { performFullScan } = useMediaScanning();
  
  // Reset settings
  const handleResetSettings = useCallback(() => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => dispatch(resetSettings()),
        },
      ]
    );
  }, [dispatch]);
  
  // Clear library
  const handleClearLibrary = useCallback(() => {
    Alert.alert(
      'Clear Library',
      'This will remove all scanned media from the library. Your actual files will not be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement clear library
            Alert.alert('Coming Soon', 'This feature is not yet implemented.');
          },
        },
      ]
    );
  }, []);
  
  // Rescan library
  const handleRescanLibrary = useCallback(async () => {
    Alert.alert(
      'Rescan Library',
      'This will scan your device for media files. This may take a few minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Scan',
          onPress: performFullScan,
        },
      ]
    );
  }, [performFullScan]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Settings" />
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Library Stats */}
        <SettingsSection title="Library">
          <SettingsRow
            title="Songs"
            value={<Text style={styles.statValue}>{allSongs.length}</Text>}
          />
          <SettingsRow
            title="Videos"
            value={<Text style={styles.statValue}>{allVideos.length}</Text>}
          />
          <SettingsRow
            title="Scan Library"
            subtitle="Re-scan device for media files"
            onPress={handleRescanLibrary}
            showArrow
          />
          <SettingsRow
            title="Clear Library"
            subtitle="Remove all scanned media"
            onPress={handleClearLibrary}
            showArrow
          />
        </SettingsSection>
        
        {/* Library Settings */}
        <SettingsSection title="Library Settings">
          <SettingsSwitchRow
            title="Auto Scan on Launch"
            subtitle="Scan for new media when app opens"
            value={settings.library.autoScanOnLaunch}
            onValueChange={(value) => dispatch(updateLibrarySettings({ autoScanOnLaunch: value }))}
          />
          <SettingsSwitchRow
            title="Include Hidden Files"
            subtitle="Include files starting with '.'"
            value={settings.library.includeHiddenFiles}
            onValueChange={(value) => dispatch(updateLibrarySettings({ includeHiddenFiles: value }))}
          />
          <SettingsSwitchRow
            title="Scan Subfolders"
            subtitle="Scan folders recursively"
            value={settings.library.scanSubfolders}
            onValueChange={(value) => dispatch(updateLibrarySettings({ scanSubfolders: value }))}
          />
          <SettingsRow
            title="Sort By"
            value={
              <Text style={styles.valueText}>
                {settings.library.defaultSortBy.charAt(0).toUpperCase() + settings.library.defaultSortBy.slice(1)}
              </Text>
            }
          />
        </SettingsSection>
        
        {/* Audio Playback Settings */}
        <SettingsSection title="Audio Playback">
          <SettingsSwitchRow
            title="Resume on Open"
            subtitle="Resume last track when app opens"
            value={settings.audio.resumePlaybackOnOpen}
            onValueChange={(value) => dispatch(updateAudioSettings({ resumePlaybackOnOpen: value }))}
          />
          <SettingsSwitchRow
            title="Gapless Playback"
            subtitle="Remove gaps between tracks"
            value={settings.audio.gaplessPlayback}
            onValueChange={(value) => dispatch(updateAudioSettings({ gaplessPlayback: value }))}
          />
          <SettingsSwitchRow
            title="Show Album Art"
            subtitle="Display artwork in Now Playing"
            value={settings.audio.showAlbumArt}
            onValueChange={(value) => dispatch(updateAudioSettings({ showAlbumArt: value }))}
          />
          <SettingsRow
            title="Default Speed"
            value={
              <Text style={styles.valueText}>
                {settings.audio.defaultPlaybackSpeed}x
              </Text>
            }
          />
        </SettingsSection>
        
        {/* Video Settings */}
        <SettingsSection title="Video Playback">
          <SettingsSwitchRow
            title="Resume on Open"
            subtitle="Resume last video position"
            value={settings.video.resumePlaybackOnOpen}
            onValueChange={(value) => dispatch(updateVideoSettings({ resumePlaybackOnOpen: value }))}
          />
          <SettingsSwitchRow
            title="Auto Rotate"
            subtitle="Rotate screen with device"
            value={settings.video.autoRotateScreen}
            onValueChange={(value) => dispatch(updateVideoSettings({ autoRotateScreen: value }))}
          />
          <SettingsSwitchRow
            title="Swipe Gestures"
            subtitle="Swipe to seek/volume/brightness"
            value={settings.video.swipeGesturesEnabled}
            onValueChange={(value) => dispatch(updateVideoSettings({ swipeGesturesEnabled: value }))}
          />
          <SettingsSwitchRow
            title="Double Tap to Seek"
            subtitle="Double tap sides to seek"
            value={settings.video.doubleTapToSeek}
            onValueChange={(value) => dispatch(updateVideoSettings({ doubleTapToSeek: value }))}
          />
        </SettingsSection>
        
        {/* Appearance */}
        <SettingsSection title="Appearance">
          <SettingsSwitchRow
            title="Show Mini Player"
            subtitle="Persistent player at bottom"
            value={settings.appearance.showMiniPlayer}
            onValueChange={(value) => dispatch(updateAppearanceSettings({ showMiniPlayer: value }))}
          />
          <SettingsSwitchRow
            title="Animations"
            subtitle="Enable UI animations"
            value={settings.appearance.animationsEnabled}
            onValueChange={(value) => dispatch(updateAppearanceSettings({ animationsEnabled: value }))}
          />
          <SettingsRow
            title="Theme"
            value={
              <Text style={styles.valueText}>
                {settings.appearance.colorScheme === 'premium_dark' ? 'Premium Dark' : 
                 settings.appearance.colorScheme.charAt(0).toUpperCase() + settings.appearance.colorScheme.slice(1)}
              </Text>
            }
          />
        </SettingsSection>
        
        {/* About */}
        <SettingsSection title="About">
          <SettingsRow
            title="Version"
            value={<Text style={styles.valueText}>{APP_VERSION}</Text>}
          />
          <SettingsRow
            title="Terra Media Player"
            subtitle="Premium Offline Media Experience"
          />
          <SettingsRow
            title="Reset Settings"
            subtitle="Restore all settings to default"
            onPress={handleResetSettings}
            showArrow
          />
        </SettingsSection>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for offline media</Text>
          <Text style={styles.footerSubtext}>© 2024 Terra Media Player</Text>
        </View>
      </ScrollView>
      
      {/* Scan Progress Modal */}
      <ScanProgressModal visible={isScanning} progress={scanProgress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: DIMENSIONS.spacing.xxl,
  },
  section: {
    marginTop: DIMENSIONS.spacing.lg,
  },
  sectionTitle: {
    fontSize: DIMENSIONS.fontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: DIMENSIONS.spacing.md,
    marginBottom: DIMENSIONS.spacing.sm,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: DIMENSIONS.spacing.md,
    paddingHorizontal: DIMENSIONS.spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  rowLeft: {
    flex: 1,
    marginRight: DIMENSIONS.spacing.md,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: DIMENSIONS.fontSize.md,
    color: Colors.textPrimary,
  },
  rowSubtitle: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  valueText: {
    fontSize: DIMENSIONS.fontSize.md,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: DIMENSIONS.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 24,
    color: Colors.textSecondary,
    marginLeft: DIMENSIONS.spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: DIMENSIONS.spacing.xl,
    paddingHorizontal: DIMENSIONS.spacing.md,
  },
  footerText: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: DIMENSIONS.spacing.xs,
  },
  footerSubtext: {
    fontSize: DIMENSIONS.fontSize.xs,
    color: Colors.textTertiary,
  },
});

export default SettingsScreen;
