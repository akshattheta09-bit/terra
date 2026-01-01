// Audio Library Screen for Terra Media Player

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
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
import { Colors } from '../utils/colors';
import { DIMENSIONS } from '../utils/constants';

type FilterType = 'all' | 'albums' | 'artists' | 'playlists' | 'recently_played' | 'most_played' | 'genres';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All Songs' },
  { key: 'albums', label: 'Albums' },
  { key: 'artists', label: 'Artists' },
  { key: 'playlists', label: 'Playlists' },
  { key: 'recently_played', label: 'Recent' },
  { key: 'most_played', label: 'Top' },
  { key: 'genres', label: 'Genres' },
];

export const AudioLibraryScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
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
  
  // Render filter chips
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
  
  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎵</Text>
      <Text style={styles.emptyTitle}>No Music Found</Text>
      <Text style={styles.emptySubtitle}>
        {isPermissionDenied
          ? 'Please grant storage permission to scan music files'
          : 'Tap the button below to scan your device for music'}
      </Text>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={performFullScan}
        activeOpacity={0.7}
      >
        <Text style={styles.scanButtonText}>Scan Music</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render song item
  const renderSongItem = useCallback(({ item }: { item: AudioFile }) => (
    <SongItem
      song={item}
      onPress={handleSongPress}
      onFavoritePress={handleFavoritePress}
      onMorePress={handleMorePress}
      isPlaying={item.id === currentTrackId}
    />
  ), [currentTrackId, handleSongPress, handleFavoritePress, handleMorePress]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Music"
        subtitle={`${allSongs.length} songs`}
        showSearch
        onSearchPress={() => setIsSearching(!isSearching)}
        rightIcon={<Text style={styles.headerIcon}>🔄</Text>}
        onRightPress={performQuickScan}
      />
      
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
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        contentContainerStyle={
          filteredSongs.length === 0 ? styles.emptyList : undefined
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
      />
      
      {/* Shuffle All FAB */}
      {filteredSongs.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            const shuffled = [...filteredSongs].sort(() => Math.random() - 0.5);
            playTracks(shuffled, 0);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>🔀</Text>
          <Text style={styles.fabText}>Shuffle</Text>
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
  headerIcon: {
    fontSize: 20,
  },
  searchContainer: {
    paddingHorizontal: DIMENSIONS.spacing.md,
    paddingVertical: DIMENSIONS.spacing.sm,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  filterList: {
    paddingHorizontal: DIMENSIONS.spacing.md,
    paddingVertical: DIMENSIONS.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: DIMENSIONS.spacing.md,
    paddingVertical: DIMENSIONS.spacing.sm,
    borderRadius: DIMENSIONS.borderRadius.full,
    backgroundColor: Colors.surfaceLight,
    marginRight: DIMENSIONS.spacing.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DIMENSIONS.spacing.xl,
  },
  emptyList: {
    flex: 1,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: DIMENSIONS.spacing.lg,
  },
  emptyTitle: {
    fontSize: DIMENSIONS.fontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: DIMENSIONS.spacing.sm,
  },
  emptySubtitle: {
    fontSize: DIMENSIONS.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: DIMENSIONS.spacing.xl,
  },
  scanButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: DIMENSIONS.spacing.xl,
    paddingVertical: DIMENSIONS.spacing.md,
    borderRadius: DIMENSIONS.borderRadius.full,
  },
  scanButtonText: {
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: '600',
    color: Colors.white,
  },
  fab: {
    position: 'absolute',
    bottom: DIMENSIONS.spacing.xl,
    right: DIMENSIONS.spacing.xl,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.spacing.lg,
    paddingVertical: DIMENSIONS.spacing.md,
    borderRadius: DIMENSIONS.borderRadius.full,
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 18,
    marginRight: DIMENSIONS.spacing.sm,
  },
  fabText: {
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default AudioLibraryScreen;
