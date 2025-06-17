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

import { act, useEffect } from "react";
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
                <MdClose size={24} />
            </button>
        </div>
    )
}

// and we also add delete case to tasksSlice

// src/redux/tasksSlice 

import { createSlice } from "@reduxjs/toolkit";
import {fetchTasks, addTask, deleteTask} from './operations';

const tasksSlice = createSlice({
    extraReducers: builder => {
        builder 
        .addCase(deleteTask.pending, state => {
            state.isLoading = true;
        })
        .addCase(deleteTask.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = null;
            const index = state.items.findIndex(
                task => task.id === action.payload.id
            );
            state.items.splice(index, 1);
        })
        .addCase(deleteTask.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        });
        // rest of the code 
    }
})

//===================================================================

// 8) Now that we added add and delete function lets add toggle function

// src/redux/operations.js

export const toggleCompleted = createAsyncThunk(
    'task/toggleCompleted',
    async (task, thunkAPI) => {
        try {
            const response = await axios.put(`/tasks/${task.id}`, {
        completed: !task.completed,
      });
      return response.data;
        }catch (e) {
            return thunkAPI.rejectWithValue(e.message);
        }
    }
)

// in task component we are adding code to change task 
// state after clicking checkbox

// src/components/Task/Task.jsx

import { useDispatch } from "react-redux";
import { MdClose } from "react-icons/md";
import { deleteTask, toggleCompleted } from 'redux/operations';

export const Task = ({ task }) => {
    const dispatch = useDispatch();

    const handleDelete = () => dispatch(deleteTask(task.id));

    const handleToggle = () => dispatch(toggleCompleted(task));

    return (
        <div>
            <input type='checkbox' checked={task.completed} on onChange={handleToggle}/>
            <p>{task.text}</p>
            <button onClick={handleDelete}>
                <MdClose size={24} />
            </button>
        </div>
    )
}
// and finally lets add code to tasksSlice

// src/redux/tasksSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { fetchTasks, addTask, deleteTask, toggleCompleted } from './operations';
import { build } from "vite";

const tasksSlice = createSlice({
    extraReducers: builder => {
        builder
        .addCase(toggleCompleted.pending, state => {
            state.isLoading = true;
        })
        .addCase(toggleCompleted.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = null;
            const index = state.items.findIndex(
                task => task.id === action.payload.id
            );
            state.items.splice(index, 1, action.payload);
        })
        .addCase(toggleCompleted.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        });
        // code of rest of reducers 
    }
})

//======================================================================

// 9) Damn that a long ass code bro 
// Lets try to make it shorter

// src/redux/tasksSlice.js


// to make our code shorter we need to analize what is repeating 
// for example state where we only start loading and rejection we can 
// define it in seperate const and add it to reducer 
const handlePending = state => {
    state.isLoading = true;
};

const handleRejeted = (state, action) => {
    state.isLoading = false;
    state.error = action.payload:
};

const tasksSlice = createSlice({
    name: "tasks",
    initialState: {
        items: [],
        isLoading: false, 
        error: null,
    },
    extraReducers: builder => {
        builder
        .addCase(fetchTasks.pending, handlePending)
        .addCase(fetchTasks.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = null;
            state.items = action.payload;
        })
        .addCase(fetchTasks.rejected, handleRejeted)
        .addCase(addTask.pending, handlePending)
        .addCase(addTask.fulfilled, (state, action) => {
            state.isLoading =false;
            state.error = null;
            state.items.push(action.payload);
        })
        .addCase(addTask.rejected, handleRejeted)
        .addCase(deleteTask.rejected, handleRejeted)
        .addCase(deleteTask.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = null;
            const index = state.items.findIndex(
                task => task.id === action.payload.id
            );
            state.items.splice(index, 1);
        })
        .addCase(deleteTask.rejected, handleRejeted)
        .addCase(toggleCompleted.pending, handlePending)
        .addCase(toggleCompleted.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = null;
            const index = state.items.findIndex(
                task => task.id === action.payload.id
            );
            state.items.splice(index, 1, action.payload);
        })
        .addCase(toggleCompleted.rejected, handleRejeted);
    },
});

export const  tasksReducer = tasksSlice.reducer;