/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { todolistsAPI } from '../../api/todolists-api'
import { appActions } from 'app/app-reducer'
import { todolistsActions, todolistThunks } from './todolists-reducer'
import { ResultCode, TaskPriorities, TaskStatuses } from 'utils/enums'
import { createAppAsyncThunk, handleServerAppError, handleServerNetworkError } from 'utils'
import {
  AddTaskArgs,
  RemoveTaskArgs,
  TaskType,
  UpdateTaskArgType,
  UpdateTaskModelType,
} from 'api/types'

const slice = createSlice({
  name: 'tasks',
  initialState: {} as TasksStateType,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        const tasksForCurrentTodolist = state[action.payload.todolistId]
        const index = tasksForCurrentTodolist.findIndex((t) => t.id === action.payload.taskId)
        if (index !== -1) tasksForCurrentTodolist.splice(index, 1)
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const tasksForCurrentTodolist = state[action.payload.task.todoListId]
        tasksForCurrentTodolist.unshift(action.payload.task)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId]
        const index = tasks.findIndex((t) => t.id === action.payload.taskId)
        if (index !== -1) tasks[index] = { ...tasks[index], ...action.payload.domainModel }
      })
      .addCase(todolistThunks.addTodolist.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(todolistThunks.removeTodolist.fulfilled, (state, action) => {
        delete state[action.payload.todolistId]
      })

      .addCase(todolistsActions.setTodolists, (state, action) => {
        action.payload.todolists.forEach((tl) => {
          state[tl.id] = []
        })
      })
  },
})

const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[]; todolistId: string }, string>(
  `${slice.name}/fetchTasks`,
  async (todolistId, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: 'loading' }))
      const res = await todolistsAPI.getTasks(todolistId)
      const tasks = res.data.items
      dispatch(appActions.setAppStatus({ status: 'succeeded' }))
      return { tasks, todolistId }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  }
)

const removeTask = createAppAsyncThunk<RemoveTaskArgs, RemoveTaskArgs>(
  `${slice.name}/removeTask`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      await todolistsAPI.deleteTask(arg.todolistId, arg.taskId)
      dispatch(tasksThunks.removeTask(arg))
      return arg
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  }
)

const addTask = createAppAsyncThunk<{ task: TaskType }, AddTaskArgs>(
  `${slice.name}/addTask`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: 'loading' }))
      const res = await todolistsAPI.createTask(arg)
      if (res.data.resultCode === ResultCode.success) {
        const task = res.data.data.item
        dispatch(appActions.setAppStatus({ status: 'succeeded' }))
        return { task }
      } else {
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  }
)

const updateTask = createAppAsyncThunk<UpdateTaskArgType, UpdateTaskArgType>(
  `${slice.name}/updateTask`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue, getState } = thunkAPI
    try {
      const task = getState().tasks[arg.todolistId].find((t) => t.id === arg.taskId)
      if (!task) {
        console.warn('task not found in the state')
        return rejectWithValue(null)
      }
      const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...arg.domainModel,
      }
      const res = await todolistsAPI.updateTask(arg.todolistId, arg.taskId, apiModel)
      if (res.data.resultCode === ResultCode.success) {
        return arg
      } else {
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  }
)

export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}
export type TasksStateType = {
  [key: string]: Array<TaskType>
}

export const tasksThunks = { fetchTasks, addTask, updateTask, removeTask }
export const tasksReducer = slice.reducer
export const tasksActions = slice.actions
