import {
    createAsyncThunk,
    createSlice,
    Dispatch,
    PayloadAction,
 } from "@reduxjs/toolkit";
 import { likeSong, unlikeSong } from "../../api/songApi";
 import { IPlaylistDetail, ISong } from "../../types";
 import { RootState } from "../store";
 import { setNewAudio, setPlayerSongLike } from "./playerSlice";
 
 interface IInitialState {
    currentSongId: number;
    currentSongIndex: number;
    playlist: IPlaylistDetail;
 }
 
 const initialState: IInitialState = {
    currentSongId: -1,
    currentSongIndex: -1,
    playlist: {
       id: 0,
       author: {
          id: 0,
          first_name: "",
          last_name: "",
          username: "",
          image: "",
       },
       title: "",
       image: "",
       color: "",
       featured: false,
       updated: "",
       created: "",
       hide: false,
       songs: [],
       liked: false,
    },
 };
 
 export const playlistSlice = createSlice({
    name: "playlist",
    initialState,
    reducers: {
       setPlaylist(state, action: PayloadAction<IPlaylistDetail>) {
          state.playlist = action.payload;
          state.currentSongId = action.payload.songs[0].id;
          state.currentSongIndex = 0;
       },
       setSelectBefore(state, action) {
          state.currentSongIndex = state.currentSongIndex - 1;
          state.currentSongId = state.playlist.songs[state.currentSongIndex].id;
       },
       setSelectNext(state, action) {
          state.currentSongIndex = state.currentSongIndex + 1;
          state.currentSongId = state.playlist.songs[state.currentSongIndex].id;
       },
       setSelectSong(state, action: PayloadAction<ISong>) {
          const song = action.payload;
          const index = state.playlist.songs.findIndex(
             (s) => s.id === song.id
          );
          state.currentSongIndex = index;
          state.currentSongId = song.id;
       },
       setPlaylistLiked(state, action: PayloadAction<boolean>) {
          state.playlist.liked = action.payload;
       },
       setPlaylistSongLike(
          state,
          action: PayloadAction<{ id: number; liked: boolean }>
       ) {
          const song = state.playlist.songs.find(
             (song) => song.id === action.payload.id
          );
          if (song) {
             song.liked = action.payload.liked;
          }
       },
    },
 });
 
 export const {
    setPlaylist,
    setSelectBefore,
    setSelectNext,
    setPlaylistSongLike,
    setSelectSong,
    setPlaylistLiked,
 } = playlistSlice.actions;
 
 export default playlistSlice.reducer;
 
 
 const setStateToLocalStoreage = async (state: RootState) => {
    const playlistState = state.playlist;
    localStorage.setItem("playlist", JSON.stringify(playlistState));
 };
 
 export const setPlaylistAction = createAsyncThunk<void, {playlist: IPlaylistDetail, setFirstSong?: boolean}>(
    "setPlaylistAction",
    async ({playlist, setFirstSong=true}, {dispatch, getState}) => {
       dispatch(setPlaylist(playlist));
       const song = playlist.songs[0];
       if (setFirstSong) {
          dispatch(setNewAudio({song: song, play: true}));
       }
       const state = getState() as RootState;
       setStateToLocalStoreage(state);
    }
 );
 
 export const selectBeforeSong = createAsyncThunk(
    "selectBeforeSong",
    async (payload, { getState, dispatch }) => {
       const state = getState() as RootState;
       const playerState = state.playlist;
       const currentIndex = playerState.currentSongIndex;
       if (currentIndex === 0) return;
       const song = playerState.playlist.songs[currentIndex - 1];
       dispatch(setNewAudio({song: song, play: true}));
       dispatch(setSelectBefore(null));
 
       setStateToLocalStoreage(state);
    }
 );
 
 export const selectNextSong = createAsyncThunk(
    "selectNextSong",
    async (payload, { getState, dispatch }) => {
       const state = getState() as RootState;
       const playerState = state.playlist;
       const currentIndex = playerState.currentSongIndex;
       if (currentIndex === playerState.playlist.songs.length - 1) return;
       const song = playerState.playlist.songs[currentIndex + 1];
       dispatch(setNewAudio({song: song, play: true}));
       dispatch(setSelectNext(null));
 
       setStateToLocalStoreage(state);
    }
 );
 
 export const changePlaylistAndSongAction = createAsyncThunk<void, {playlist:IPlaylistDetail, song: ISong}>(
    "changeSongAction",
    async ({playlist, song}, { dispatch, getState }) => {
       dispatch(setPlaylist(playlist));
       dispatch(setNewAudio({song: song, play: true}));
       dispatch(setSelectSong(song));
 
       const state = getState() as RootState;
       setStateToLocalStoreage(state);
    }
 )
 
 export const loadStoredPlaylist = createAsyncThunk(
    "loadStoredPlaylist",
    async (payload, { dispatch, getState }) => {
       const playlist = JSON.parse(localStorage.getItem("playlist") || "{}");
       if (playlist.playlist) {
          dispatch(setPlaylist(playlist.playlist));
          const storagedSong = playlist.playlist.songs[playlist.currentSongIndex]
          dispatch(setSelectSong(storagedSong));
          dispatch(setNewAudio({song: storagedSong, play: false})); 
       }
    }
 );
 
 export const toggleLikeSongAction = createAsyncThunk(
    "likeSongAction",
    async (songId: number, { dispatch, getState }) => {
       const state = getState() as RootState;
       const playlistState = state.playlist;
       const song = playlistState.playlist.songs.find(
          (song) => song.id === songId
       ) as ISong;
       if (song.liked) {
          unlikeSong(songId).then((response) => {
             dispatch(setPlaylistSongLike({ id: songId, liked: false }));
             dispatch(setPlayerSongLike(false))
          });
       } else {
         likeSong(songId).then((response) => {
             dispatch(setPlaylistSongLike({ id: songId, liked: true }));
             dispatch(setPlayerSongLike(true))
          });
       }
    }
 );