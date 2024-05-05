/* eslint-disable @typescript-eslint/no-unused-vars */
import { todolistsAPI } from '../../api/todolists-api'
import { AppThunk } from '../../app/store'
import { appActions, RequestStatusType } from 'app/app-reducer'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { createAppAsyncThunk, handleServerNetworkError } from 'utils'
import { TodolistType } from 'api/types'

const slice = createSlice({
  name: 'todolists',
  initialState: [] as TodolistDomainType[],
  reducers: {
    setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
      action.payload.todolists.forEach((tl) =>
        state.push({ ...tl, filter: 'all', entityStatus: 'idle' })
      )
    },
    changeTodolistTitle: (state, action: PayloadAction<{ title: string; id: string }>) => {
      const index = state.findIndex((todo) => todo.id === action.payload.id)
      if (index !== -1) state[index].title = action.payload.title
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(removeTodolist.fulfilled, (state, action) => {
        const index = state.findIndex((todo) => todo.id === action.payload.todolistId)
        if (index !== -1) state.splice(index, 1)
      })
      .addCase(addTodolist.fulfilled, (state, action) => {
        state.unshift({ ...action.payload.todolist, filter: 'all', entityStatus: 'idle' })
      })
    // .addCase(changeTodolistTitle.fulfilled, (state, action) => {
    //   const index = state.findIndex((todo) => todo.id === action.payload.id)
    //   if (index !== -1) state[index].title = action.payload.title
    // })
    // .addCase(changeTodolistFilter.fulfilled, (state, action) => {
    //   const index = state.findIndex((todo) => todo.id === action.payload.id)
    //   if (index !== -1) state[index].filter = action.payload.filter
    // })
    // .addCase(changeTodolistEntityStatus.fulfilled, (state, action) => {
    //   const index = state.findIndex((todo) => todo.id === action.payload.id)
    //   if (index !== -1) state[index].entityStatus = action.payload.entityStatus
    // })
  },
})

export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: 'loading' }))
    todolistsAPI
      .getTodolists()
      .then((res) => {
        dispatch(todolistsActions.setTodolists({ todolists: res.data }))
        dispatch(appActions.setAppStatus({ status: 'succeeded' }))
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch)
      })
  }
}

const removeTodolist = createAppAsyncThunk<{ todolistId: string }, { todolistId: string }>(
  `${slice.name}/removeTodolist`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(
        todolistThunks.changeTodolistEntityStatus({ id: arg.todolistId, entityStatus: 'loading' })
      )
      const res = await todolistsAPI.deleteTodolist(arg.todolistId)
      dispatch(appActions.setAppStatus({ status: 'succeeded' }))
      return arg
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  }
)

const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, { title: string }>(
  `${slice.name}/addTodolist`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: 'loading' }))
      const res = await todolistsAPI.createTodolist(arg.title)
      dispatch(appActions.setAppStatus({ status: 'succeeded' }))
      return { todolist: res.data.data.item }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  }
)

const changeTodolistTitle = createAppAsyncThunk<
  { id: string; title: string },
  { id: string; title: string }
>(`${slice.name}/changeTodolistTitle`, async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI
  try {
    const res = await todolistsAPI.updateTodolist(arg.id, arg.title)
    return arg
  } catch (e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})

const changeTodolistFilter = createAppAsyncThunk<
  { id: string; filter: FilterValuesType },
  { id: string; filter: FilterValuesType }
>(`${slice.name}/changeTodolistTitle`, async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI
  try {
    const res = await todolistsAPI.updateTodolist(arg.id, arg.filter)
    return arg
  } catch (e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})

const changeTodolistEntityStatus = createAppAsyncThunk<
  { id: string; entityStatus: RequestStatusType },
  { id: string; entityStatus: RequestStatusType }
>(`${slice.name}/changeTodolistTitle`, async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI
  try {
    const res = await todolistsAPI.updateTodolist(arg.id, arg.entityStatus)
    return arg
  } catch (e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})

export type FilterValuesType = 'all' | 'active' | 'completed'
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}

export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions
export const todolistThunks = {
  removeTodolist,
  addTodolist,
  changeTodolistTitle,
  changeTodolistFilter,
  changeTodolistEntityStatus,
}
