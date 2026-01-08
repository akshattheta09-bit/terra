// Favorites Screen for Terra Media Player

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { toggleFavorite, toggleVideoFavorite } from '../store';
import { Header, SearchBar, SongItem, VideoItem } from '../components';
import { AudioFile, VideoFile } from '../types/media';
import { Colors } from '../utils/colors';
import { DIMENSIONS } from '../utils/constants';

type TabType = 'all' | 'songs' | 'videos';

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  const { allSongs } = useAppSelector(state => state.audio);
  const { allVideos } = useAppSelector(state => state.video);
  const { currentTrackId } = useAppSelector(state => state.playback);
  
  const { playTrack, playTracks } = useAudioPlayback();
  
  // Get favorite items
  const favoriteSongs = allSongs.filter(song => song.isFavorite);
  const favoriteVideos = allVideos.filter(video => video.isFavorite);
  
  // Filter by search
  const getFilteredSongs = useCallback(() => {
    if (!searchQuery.trim()) return favoriteSongs;
    
    const query = searchQuery.toLowerCase();
    return favoriteSongs.filter(
      song =>
        song.title?.toLowerCase().includes(query) ||
        song.artist?.toLowerCase().includes(query) ||
        song.album?.toLowerCase().includes(query)
    );
  }, [favoriteSongs, searchQuery]);
  
  const getFilteredVideos = useCallback(() => {
    if (!searchQuery.trim()) return favoriteVideos;
    
    const query = searchQuery.toLowerCase();
    return favoriteVideos.filter(
      video =>
        video.title?.toLowerCase().includes(query) ||
        video.fileName.toLowerCase().includes(query)
    );
  }, [favoriteVideos, searchQuery]);
  
  const filteredSongs = getFilteredSongs();
  const filteredVideos = getFilteredVideos();
  
  // Handle song press
  const handleSongPress = useCallback((song: AudioFile) => {
    playTrack(song);
  }, [playTrack]);
  
  // Handle video press
  const handleVideoPress = useCallback((video: VideoFile) => {
    navigation.navigate('VideoPlayer', { videoId: video.id });
  }, [navigation]);
  
  // Handle favorite toggle
  const handleSongFavoritePress = useCallback((song: AudioFile) => {
    dispatch(toggleFavorite(song.id));
  }, [dispatch]);
  
  const handleVideoFavoritePress = useCallback((video: VideoFile) => {
    dispatch(toggleVideoFavorite(video.id));
  }, [dispatch]);
  
  // Render tabs
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {[
        { key: 'all' as TabType, label: 'All', count: favoriteSongs.length + favoriteVideos.length },
        { key: 'songs' as TabType, label: 'Songs', count: favoriteSongs.length },
        { key: 'videos' as TabType, label: 'Videos', count: favoriteVideos.length },
      ].map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => setActiveTab(tab.key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
            {tab.label}
          </Text>
          <View style={[styles.badge, activeTab === tab.key && styles.badgeActive]}>
            <Text style={[styles.badgeText, activeTab === tab.key && styles.badgeTextActive]}>
              {tab.count}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>❤️</Text>
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the heart icon on songs or videos to add them to your favorites
      </Text>
    </View>
  );
  
  // Render song item
  const renderSongItem = useCallback(({ item }: { item: AudioFile }) => (
    <SongItem
      song={item}
      onPress={handleSongPress}
      onFavoritePress={handleSongFavoritePress}
      isPlaying={item.id === currentTrackId}
    />
  ), [currentTrackId, handleSongPress, handleSongFavoritePress]);
  
  // Render video item
  const renderVideoItem = useCallback(({ item }: { item: VideoFile }) => (
    <VideoItem
      video={item}
      onPress={handleVideoPress}
      viewMode="list"
      style={styles.videoItem}
    />
  ), [handleVideoPress]);
  
  // Render content based on active tab
  const renderContent = () => {
    if (activeTab === 'songs') {
      return (
        <FlatList
          data={filteredSongs}
          keyExtractor={item => `song-${item.id}`}
          renderItem={renderSongItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={filteredSongs.length === 0 && styles.emptyList}
          showsVerticalScrollIndicator={false}
        />
      );
    }
    
    if (activeTab === 'videos') {
      return (
        <FlatList
          data={filteredVideos}
          keyExtractor={item => `video-${item.id}`}
          renderItem={renderVideoItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.videoList,
            filteredVideos.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
        />
      );
    }
    
    // All tab - mixed content
    if (filteredSongs.length === 0 && filteredVideos.length === 0) {
      return renderEmpty();
    }
    
    // Combine items with a type discriminator
    type MixedItem = 
      | { type: 'song'; data: AudioFile }
      | { type: 'video'; data: VideoFile }
      | { type: 'header'; title: string; count: number };
    
    const mixedItems: MixedItem[] = [];
    
    if (filteredSongs.length > 0) {
      mixedItems.push({ type: 'header', title: 'Songs', count: filteredSongs.length });
      filteredSongs.forEach(song => mixedItems.push({ type: 'song', data: song }));
    }
    
    if (filteredVideos.length > 0) {
      mixedItems.push({ type: 'header', title: 'Videos', count: filteredVideos.length });
      filteredVideos.forEach(video => mixedItems.push({ type: 'video', data: video }));
    }
    
    return (
      <FlatList
        data={mixedItems}
        keyExtractor={(item, index) => {
          if (item.type === 'header') return `header-${item.title}`;
          if (item.type === 'song') return `song-${item.data.id}`;
          return `video-${item.data.id}`;
        }}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{item.title}</Text>
                <Text style={styles.sectionCount}>{item.count}</Text>
              </View>
            );
          }
          if (item.type === 'song') {
            return (
              <SongItem
                song={item.data}
                onPress={handleSongPress}
                onFavoritePress={handleSongFavoritePress}
                isPlaying={item.data.id === currentTrackId}
              />
            );
          }
          return (
            <VideoItem
              video={item.data}
              onPress={handleVideoPress}
              viewMode="list"
              style={styles.videoItem}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={mixedItems
          .map((item, index) => item.type === 'header' ? index : -1)
          .filter(i => i !== -1)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Favorites"
        subtitle={`${favoriteSongs.length + favoriteVideos.length} items`}
        showSearch
        onSearchPress={() => setIsSearching(!isSearching)}
      />
      
      {/* Search Bar */}
      {isSearching && (
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search favorites..."
            autoFocus
          />
        </View>
      )}
      
      {/* Tabs */}
      {renderTabs()}
      
      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      {/* Shuffle Favorites FAB (only for songs) */}
      {filteredSongs.length > 1 && activeTab !== 'videos' && (
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: DIMENSIONS.spacing.md,
    paddingVertical: DIMENSIONS.spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: DIMENSIONS.spacing.md,
    paddingVertical: DIMENSIONS.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DIMENSIONS.spacing.sm,
    borderRadius: DIMENSIONS.borderRadius.sm,
    marginHorizontal: DIMENSIONS.spacing.xs,
  },
  tabActive: {
    backgroundColor: Colors.error + '20',
  },
  tabText: {
    fontSize: DIMENSIONS.fontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginRight: DIMENSIONS.spacing.xs,
  },
  tabTextActive: {
    color: Colors.error,
  },
  badge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: DIMENSIONS.spacing.sm,
    paddingVertical: 2,
    borderRadius: DIMENSIONS.borderRadius.full,
  },
  badgeActive: {
    backgroundColor: Colors.error,
  },
  badgeText: {
    fontSize: DIMENSIONS.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  badgeTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  videoList: {
    padding: DIMENSIONS.spacing.md,
  },
  videoItem: {
    marginBottom: DIMENSIONS.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    paddingHorizontal: DIMENSIONS.spacing.md,
    paddingVertical: DIMENSIONS.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sectionTitle: {
    fontSize: DIMENSIONS.fontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontSize: DIMENSIONS.fontSize.sm,
    color: Colors.textSecondary,
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
  },
  fab: {
    position: 'absolute',
    bottom: DIMENSIONS.spacing.xl,
    right: DIMENSIONS.spacing.xl,
    backgroundColor: Colors.error,
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

export default FavoritesScreen;
