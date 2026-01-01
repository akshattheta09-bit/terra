// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO LIBRARY SCREEN - Premium Apple-Style Design
// Terra Media Player - Luxury & Clean Interface
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { useMediaScanning } from '../hooks/useMediaScanning';
import {
  setAudioFilter,
  toggleFavorite,
  openAddToPlaylistModal,
  loadAllAudioFiles,
  loadPlaylists,
} from '../store';
import { Header, SearchBar, SongItem, ScanProgressModal } from '../components';
import { AudioFile } from '../types/media';
import { Colors, Shadows, Typography } from '../utils/colors';
import { DIMENSIONS } from '../utils/constants';

type FilterType = 'all' | 'albums' | 'artists' | 'playlists' | 'recently_played' | 'most_played' | 'genres';

const FILTERS: { key: FilterType; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '♫' },
  { key: 'recently_played', label: 'Recent', icon: '🕐' },
  { key: 'most_played', label: 'Top', icon: '⭐' },
  { key: 'albums', label: 'Albums', icon: '💿' },
  { key: 'artists', label: 'Artists', icon: '🎤' },
  { key: 'playlists', label: 'Playlists', icon: '📝' },
];

export const AudioLibraryScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const scrollY = new Animated.Value(0);
  
  const { allSongs, albums, artists, playlists, genres, filter } = useAppSelector(
    state => state.audio
  );
  const { currentTrackId } = useAppSelector(state => state.playback);
  const { isScanning, scanProgress } = useAppSelector(state => state.ui);
  
  const { playTrack, playTracks } = useAudioPlayback();
  const { performFullScan, performQuickScan, isPermissionDenied } = useMediaScanning();
  
  // Initial load
  useEffect(() => {
    dispatch(loadAllAudioFiles());
    dispatch(loadPlaylists());
  }, [dispatch]);
  
  // Filter songs based on current filter
  const getFilteredSongs = useCallback((): AudioFile[] => {
    let filtered = [...allSongs];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        song =>
          song.title?.toLowerCase().includes(query) ||
          song.artist?.toLowerCase().includes(query) ||
          song.album?.toLowerCase().includes(query) ||
          song.fileName.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    switch (filter) {
      case 'recently_played':
        return filtered
          .filter(s => s.lastPlayed)
          .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0))
          .slice(0, 100);
      case 'most_played':
        return filtered
          .filter(s => s.playCount > 0)
          .sort((a, b) => b.playCount - a.playCount)
          .slice(0, 50);
      default:
        return filtered.sort((a, b) => 
          (a.title || a.fileName).localeCompare(b.title || b.fileName)
        );
    }
  }, [allSongs, filter, searchQuery]);
  
  const filteredSongs = getFilteredSongs();
  
  // Handle song press
  const handleSongPress = useCallback((song: AudioFile) => {
    playTrack(song);
  }, [playTrack]);
  
  // Handle favorite toggle
  const handleFavoritePress = useCallback((song: AudioFile) => {
    dispatch(toggleFavorite(song.id));
  }, [dispatch]);
  
  // Handle more options
  const handleMorePress = useCallback((song: AudioFile) => {
    dispatch(openAddToPlaylistModal(song.id));
  }, [dispatch]);
  
  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await performQuickScan();
  }, [performQuickScan]);
  
  // Handle filter change
  const handleFilterChange = useCallback((newFilter: FilterType) => {
    dispatch(setAudioFilter(newFilter));
  }, [dispatch]);
  
  // Render filter chips - Premium pill style
  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={item => item.key}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === item.key && styles.filterChipActive,
            ]}
            onPress={() => handleFilterChange(item.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterChipIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.filterChipText,
                filter === item.key && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );
  
  // Render premium empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>🎵</Text>
      </View>
      <Text style={styles.emptyTitle}>Your Music Library</Text>
      <Text style={styles.emptySubtitle}>
        {isPermissionDenied
          ? 'Grant storage permission to access your music'
          : 'Scan your device to discover your music collection'}
      </Text>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={performFullScan}
        activeOpacity={0.8}
      >
        <Text style={styles.scanButtonText}>Scan Music</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render song item
  const renderSongItem = useCallback(({ item, index }: { item: AudioFile; index: number }) => (
    <Animated.View>
      <SongItem
        song={item}
        onPress={handleSongPress}
        onFavoritePress={handleFavoritePress}
        onMorePress={handleMorePress}
        isPlaying={item.id === currentTrackId}
      />
    </Animated.View>
  ), [currentTrackId, handleSongPress, handleFavoritePress, handleMorePress]);

  // Item separator for visual breathing room
  const ItemSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Premium Large Title Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <Text style={styles.headerGreeting}>Library</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setIsSearching(!isSearching)}
              activeOpacity={0.7}
            >
              <Text style={styles.headerIcon}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={performQuickScan}
              activeOpacity={0.7}
            >
              <Text style={styles.headerIcon}>↻</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerTitle}>Music</Text>
        <Text style={styles.headerSubtitle}>
          {allSongs.length} {allSongs.length === 1 ? 'song' : 'songs'}
        </Text>
      </View>
      
      {/* Search Bar */}
      {isSearching && (
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search songs, artists, albums..."
            autoFocus
          />
        </View>
      )}
      
      {/* Filter Chips */}
      {renderFilterChips()}
      
      {/* Songs List */}
      <FlatList
        data={filteredSongs}
        keyExtractor={item => item.id.toString()}
        renderItem={renderSongItem}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={ItemSeparator}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          filteredSongs.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={10}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
      
      {/* Premium Floating Shuffle Button */}
      {filteredSongs.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            const shuffled = [...filteredSongs].sort(() => Math.random() - 0.5);
            playTracks(shuffled, 0);
          }}
          activeOpacity={0.85}
        >
          <View style={styles.fabInner}>
            <Text style={styles.fabIcon}>▶</Text>
            <Text style={styles.fabText}>Shuffle All</Text>
          </View>
        </TouchableOpacity>
      )}
      
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
  
  // Premium Header
  headerContainer: {
    paddingHorizontal: DIMENSIONS.spacing.lg,
    paddingTop: DIMENSIONS.spacing.md,
    paddingBottom: DIMENSIONS.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DIMENSIONS.spacing.xs,
  },
  headerGreeting: {
    ...Typography.subhead,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: DIMENSIONS.spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 18,
  },
  headerTitle: {
    ...Typography.largeTitle,
    color: Colors.textPrimary,
    marginBottom: DIMENSIONS.spacing.xxs,
  },
  headerSubtitle: {
    ...Typography.subhead,
    color: Colors.textSecondary,
  },
  
  // Search
  searchContainer: {
    paddingHorizontal: DIMENSIONS.spacing.lg,
    paddingBottom: DIMENSIONS.spacing.md,
  },
  
  // Premium Filter Chips
  filterContainer: {
    marginBottom: DIMENSIONS.spacing.sm,
  },
  filterList: {
    paddingHorizontal: DIMENSIONS.spacing.lg,
    gap: DIMENSIONS.spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.spacing.md,
    paddingVertical: DIMENSIONS.spacing.sm,
    borderRadius: DIMENSIONS.borderRadius.full,
    backgroundColor: Colors.surfaceLight,
    marginRight: DIMENSIONS.spacing.sm,
    gap: DIMENSIONS.spacing.xs,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipIcon: {
    fontSize: 14,
  },
  filterChipText: {
    ...Typography.footnote,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  
  // List
  listContent: {
    paddingBottom: 140, // Space for FAB and mini player
  },
  separator: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: DIMENSIONS.spacing.lg + DIMENSIONS.albumArt.thumbnail + DIMENSIONS.spacing.md,
  },
  emptyList: {
    flex: 1,
  },
  
  // Premium Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DIMENSIONS.spacing.xxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DIMENSIONS.spacing.xl,
    ...Shadows.md,
  },
  emptyIcon: {
    fontSize: 44,
  },
  emptyTitle: {
    ...Typography.title2,
    color: Colors.textPrimary,
    marginBottom: DIMENSIONS.spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: DIMENSIONS.spacing.xl,
    maxWidth: 280,
    lineHeight: 24,
  },
  scanButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: DIMENSIONS.spacing.xl,
    paddingVertical: DIMENSIONS.spacing.md,
    borderRadius: DIMENSIONS.borderRadius.full,
    ...Shadows.glow,
  },
  scanButtonText: {
    ...Typography.headline,
    color: Colors.white,
  },
  
  // Premium Floating Action Button
  fab: {
    position: 'absolute',
    bottom: DIMENSIONS.spacing.xl + DIMENSIONS.miniPlayer,
    alignSelf: 'center',
    ...Shadows.glowStrong,
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: DIMENSIONS.spacing.lg,
    paddingVertical: DIMENSIONS.spacing.md,
    borderRadius: DIMENSIONS.borderRadius.full,
    gap: DIMENSIONS.spacing.sm,
  },
  fabIcon: {
    fontSize: 14,
    color: Colors.white,
  },
  fabText: {
    ...Typography.headline,
    color: Colors.white,
  },
});

export default AudioLibraryScreen;
