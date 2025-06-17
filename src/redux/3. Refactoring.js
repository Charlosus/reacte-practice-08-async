// 1) Refactoring code 
// src/redux/slectors.js

export const getTasks = state => state.tasks.items;

export const getIsLoading = state => state.tasks.getIsLoading;

export const getError = state => state.tasks.error;

export const getStatusFilter = state => state.filters.status;

// we already have operations and reducers to read array of operations
// We are adding component App so after mount fetchTasks would process

// 2) Adding useEffect with fetchTasks()

// src/components/App.jsx

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchTasks } from "redux/operations";
// importing components

export const App = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchTasks());
    }, [dispatch]);

   return (
    <Layout>
      <AppBar />
      <TaskForm />
      <TaskList />
    </Layout>
  );
};

// 3) Adding indicator of requests 

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks } from "redux/operations";
import { getError, getIsLoading } from "redux/selectors";
import { createAsyncThunk } from "@reduxjs/toolkit";
// Importowanie komponentów

export const App = () => {
  const dispatch = useDispatch();

  // here we add isLoading and error indicator
  const isLoading = useSelector(getIsLoading);
  const error = useSelector(getError);

  useEffect(()=> {
    dispatch(fetchTasks());
  }, [dispatch]);

  return (
    <Layout>
      <AppBar />
      <TaskForm />
      
      {/* adding error and isLoading component or loader */}
      {isLoading && !error && <b>Request in progress...</b>}
            <TaskList />
    </Layout>
  ) 
}

// ======================================================================

// 4) Lets add possibilty to add task that awaits only text input form 
// user, our backend will be responsible for adding uniqe ID to tasks 
// and completet property 

// src/redux/operations.js

export const addTask = createAsyncThunk(
    'tasks/addTask',
    async (text, thunkAPI ) => {
        try {
            const response = await axios.post('/task',{text});
            return response.data;
        } catch (e) {
            return thunkAPI.rejectWithValue(e.message);
        }
    } 
)

//======================================================================

// 5) in TaskForm component we add code that initiate adding operation
// after submiting a form 

// src/components/TaskForm/TaskForm.jsx

import { useDispatch } from "react-redux";
import { addTask } from 'redux/operation';

export const TaskForm = () => {
    const dispatch = useDispatch();

    const handleSubmit = event => {
        event.preventDefault();
        const form = event.target;
        dispatch(addTask(event.target.elements.text.value));
        form.reset();
    };
    return 
    //
}

//======================================================================

// 6) Adding code to process action of adding task

import { createSlice } from "@reduxjs/toolkit";
import { fetchTasks, addTask } from "./2. creatingAsyncThunk";

const tasksSlice = createSlice({
    extraReducers:
    builder => {
        builder
        .addCase(addTask.pending, state => {
            state.isLoading = true;
        })
        .addCase(addTask.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = null;
            state.items.push(action.payload);
        })
        .addCase(addTask.rejected, (state, action) => {
            state.isLoading =false;
            state.error = action.payload;
        });
        // previus code of rest reducer 
    },
});

//===========================================================================

// 7) Adding deleting action 
// lets start with adding deleteTask to operations 

// src/redux/operations.js

export const deleteTask = createAsyncThunk(
    'tasks/deleteTask',
    async (taskId, thunkAPI) => {
        try {
            const response = await axios.delete(`/tasks/${taskId}`);
            return response.data;
        } catch (e) {
            return thunkAPI.rejectWithValue(e.message);
        }
    }
);

// in Task component lets add a dispatch to deleteTask 

// src/component/Task/Task.jsx

import { useDispatch } from "react-redux";
import { MdClose } from "react-icons/md";
import {deleteTask} from 'redux/operation';

export const Task = ({task}) => {
    const dispatch = useDispatch();

    const handleDelete = () => dispatch(deleteTask(task.id));

    return (
        <div>
            <input type="checkbox" checked={task.completed} />
            <p>{task.text}</p>
            <button onClick={handleDelete}>
                <MdClose size={24}></MdClose>
            </button>
        </div>
    )
}