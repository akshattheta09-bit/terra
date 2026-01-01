// Video Library Screen for Terra Media Player

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { useMediaScanning } from '../hooks/useMediaScanning';
import {
  setVideoFilter,
  setVideoSortBy,
  loadAllVideoFiles,
} from '../store';
import { Header, SearchBar, VideoItem, ScanProgressModal } from '../components';
import { VideoFile } from '../types/media';
import { Colors } from '../utils/colors';
import { DIMENSIONS } from '../utils/constants';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'folders' | 'recently_played' | 'most_played';
type SortType = 'title' | 'date' | 'duration' | 'size';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All Videos' },
  { key: 'folders', label: 'Folders' },
  { key: 'recently_played', label: 'Recent' },
  { key: 'most_played', label: 'Top' },
];

export const VideoLibraryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const { allVideos, folders, filter, sortBy } = useAppSelector(
    state => state.video
  );
  const { isScanning, scanProgress } = useAppSelector(state => state.ui);
  
  const { performFullScan, performQuickScan, isPermissionDenied } = useMediaScanning();
  
  // Calculate grid columns
  const numColumns = viewMode === 'grid' ? 2 : 1;
  const itemWidth = viewMode === 'grid' 
    ? (width - DIMENSIONS.spacing.md * 3) / 2 
    : width - DIMENSIONS.spacing.md * 2;
  
  // Initial load
  useEffect(() => {
    dispatch(loadAllVideoFiles());
  }, [dispatch]);
  
  // Filter videos based on current filter
  const getFilteredVideos = useCallback((): VideoFile[] => {
    let filtered = [...allVideos];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        video =>
          video.title?.toLowerCase().includes(query) ||
          video.fileName.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    switch (filter) {
      case 'recently_played':
        return filtered
          .filter(v => v.lastPlayed)
          .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0))
          .slice(0, 50);
      case 'most_played':
        return filtered
          .filter(v => v.playCount > 0)
          .sort((a, b) => b.playCount - a.playCount)
          .slice(0, 50);
      default:
        // Sort by selected option
        return filtered.sort((a, b) => {
          switch (sortBy) {
            case 'date':
              return b.dateAdded - a.dateAdded;
            case 'duration':
              return b.duration - a.duration;
            case 'size':
              return b.fileSize - a.fileSize;
            default:
              return (a.title || a.fileName).localeCompare(b.title || b.fileName);
          }
        });
    }
  }, [allVideos, filter, sortBy, searchQuery]);
  
  const filteredVideos = getFilteredVideos();
  
  // Handle video press
  const handleVideoPress = useCallback((video: VideoFile) => {
    navigation.navigate('VideoPlayer', { videoId: video.id });
  }, [navigation]);
  
  // Handle filter change
  const handleFilterChange = useCallback((newFilter: FilterType) => {
    dispatch(setVideoFilter(newFilter));
  }, [dispatch]);
  
  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await performQuickScan();
  }, [performQuickScan]);
  
  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);
  
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
      
      {/* View Mode Toggle */}
      <TouchableOpacity
        style={styles.viewModeButton}
        onPress={toggleViewMode}
        activeOpacity={0.7}
      >
        <Text style={styles.viewModeIcon}>
          {viewMode === 'grid' ? '▤' : '☰'}
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎬</Text>
      <Text style={styles.emptyTitle}>No Videos Found</Text>
      <Text style={styles.emptySubtitle}>
        {isPermissionDenied
          ? 'Please grant storage permission to scan video files'
          : 'Tap the button below to scan your device for videos'}
      </Text>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={performFullScan}
        activeOpacity={0.7}
      >
        <Text style={styles.scanButtonText}>Scan Videos</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render video item
  const renderVideoItem = useCallback(({ item }: { item: VideoFile }) => (
    <VideoItem
      video={item}
      onPress={handleVideoPress}
      style={[
        viewMode === 'grid' ? styles.gridItem : styles.listItem,
        { width: itemWidth },
      ]}
      viewMode={viewMode}
    />
  ), [handleVideoPress, viewMode, itemWidth]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Videos"
        subtitle={`${allVideos.length} videos`}
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
            placeholder="Search videos..."
            autoFocus
          />
        </View>
      )}
      
      {/* Filter Chips */}
      {renderFilterChips()}
      
      {/* Videos Grid/List */}
      <FlatList
        data={filteredVideos}
        keyExtractor={item => item.id.toString()}
        renderItem={renderVideoItem}
        ListEmptyComponent={renderEmpty}
        numColumns={numColumns}
        key={viewMode} // Force re-render on view mode change
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        contentContainerStyle={[
          styles.videoList,
          filteredVideos.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
      
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
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  filterList: {
    flex: 1,
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
    backgroundColor: Colors.secondary,
  },
  filterChipText: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  viewModeButton: {
    padding: DIMENSIONS.spacing.md,
    marginRight: DIMENSIONS.spacing.sm,
  },
  viewModeIcon: {
    fontSize: 20,
    color: Colors.textPrimary,
  },
  videoList: {
    padding: DIMENSIONS.spacing.md,
  },
  gridItem: {
    margin: DIMENSIONS.spacing.xs,
  },
  listItem: {
    marginBottom: DIMENSIONS.spacing.sm,
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
    backgroundColor: Colors.secondary,
    paddingHorizontal: DIMENSIONS.spacing.xl,
    paddingVertical: DIMENSIONS.spacing.md,
    borderRadius: DIMENSIONS.borderRadius.full,
  },
  scanButtonText: {
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default VideoLibraryScreen;
