/* eslint-disable @typescript-eslint/no-unused-vars */
import { Dispatch } from 'redux'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk } from 'app/store'
import { appActions } from 'app/app-reducer'
import { handleServerAppError, handleServerNetworkError } from 'utils'
import { authAPI } from 'api/auth-api'
import { LoginParamsType } from 'api/types'

const slice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: false,
  },
  reducers: {
    setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
      state.isLoggedIn = action.payload.isLoggedIn
    },
  },
})

export const loginTC =
  (data: LoginParamsType): AppThunk =>
  (dispatch) => {
    dispatch(appActions.setAppStatus({ status: 'loading' }))
    authAPI
      .login(data)
      .then((res) => {
        if (res.data.resultCode === 0) {
          dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }))
          dispatch(appActions.setAppStatus({ status: 'succeeded' }))
        } else {
          handleServerAppError(res.data, dispatch)
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch)
      })
  }
export const logoutTC = (): AppThunk => (dispatch) => {
  dispatch(appActions.setAppStatus({ status: 'loading' }))
  authAPI
    .logout()
    .then((res) => {
      if (res.data.resultCode === 0) {
        dispatch(authActions.setIsLoggedIn({ isLoggedIn: false }))
        dispatch(appActions.setAppStatus({ status: 'succeeded' }))
      } else {
        handleServerAppError(res.data, dispatch)
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch)
    })
}

export const authReducer = slice.reducer
export const authActions = slice.actions
