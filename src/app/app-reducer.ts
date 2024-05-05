/* eslint-disable @typescript-eslint/no-unused-vars */
import { Dispatch } from 'redux'
import { authActions } from 'features/Login/auth-reducer'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { AppThunk } from './store'
import { authAPI } from 'api/auth-api'

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const slice = createSlice({
  name: 'app',
  initialState: {
    status: 'idle' as RequestStatusType,
    error: null as string | null,
    isInitialized: false,
  },
  reducers: {
    setAppError: (state, action: PayloadAction<{ error: string | null }>) => {
      state.error = action.payload.error
    },
    setAppStatus: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
      state.status = action.payload.status
    },
    setAppInitialized: (state, action: PayloadAction<{ isInitialized: boolean }>) => {
      state.isInitialized = action.payload.isInitialized
    },
  },
})

export const appReducer = slice.reducer
export const appActions = slice.actions
export type AppInitialStateType = ReturnType<typeof slice.getInitialState>

export const initializeAppTC = (): AppThunk => async (dispatch) => {
  const res = await authAPI.me()
  if (res.data.resultCode === 0) {
    dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }))
  } else {
  }

  dispatch(appActions.setAppInitialized({ isInitialized: true }))
}
