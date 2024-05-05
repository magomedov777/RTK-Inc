import { appActions } from 'app/app-reducer'
import { Dispatch } from '@reduxjs/toolkit'
import { ResponseType } from 'api/types'

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch) => {
  if (data.messages.length) {
    dispatch(appActions.setAppError({ error: data.messages[0] }))
  } else {
    dispatch(appActions.setAppError({ error: 'Some error occurred' }))
  }
  dispatch(appActions.setAppError({ error: 'failed' }))
}
