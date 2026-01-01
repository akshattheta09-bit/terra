// Redux Store Configuration for Terra Media Player

import { configureStore } from '@reduxjs/toolkit';
import audioReducer from './audioSlice';
import videoReducer from './videoSlice';
import playbackReducer from './playbackSlice';
import videoPlaybackReducer from './videoPlaybackSlice';
import uiReducer from './uiSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    audio: audioReducer,
    video: videoReducer,
    playback: playbackReducer,
    videoPlayback: videoPlaybackReducer,
    ui: uiReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['playback/updatePlaybackStatus'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['playback.sound'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store as default
export default store;
