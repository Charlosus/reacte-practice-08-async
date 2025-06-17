// 1) Async use in slice

// lets create first element to kick start a async
// our task element need to hold besied array of elements
// also need to hold bolean value for loading and
// place co store errors
import { createSlice } from '@reduxjs/toolkit';

const tasksSlice = createSlice({
  name: 'tasks', // name of our slice
  initialState: {
    items: [], // array of elements
    isLoading: false, // information if is loading
    error: null,
  },
  reducers: {},
});

//=======================================================================

// 2) Now lets add and reducer

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    // Executed when an HTTP request is started
    fetchingInProgress(state) {},
    // Executed if HTTP request was successful
    fetchingSuccess() {},
    // Executed if the HTTP request ended with an error
    fetchingError() {},
  },
});

// ==========================================================================

// 3) changing states durring loading
// we need assigne changes to the state durring request

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    fetchingInProgress(state) {
      state.isLoading = true; // durring pending request loading is true
    },
    fetchingSuccess(state, action) {
      // if fetch was successful we turn of loader
      // and assinge action that we want to process with data
      state.isLoading = false;
      state.error = null;
      state.items = action.payload;
    },
    fetchingError(state, action) {
      // if fetch was unsuccessful we turn off loader
      // and we defiane what we want to do with error
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

// at the end we are destructurizing and exporting tasksSlice.actions
export const { fetchingInProgress, fetchingSuccess, fetchingError } =
  tasksSlice.actions;

//=====================================================================

// 4) Now that we have our slice define we need to define fetch function 
// we will be using axios to operate 

// src/redux operations.js

import axios from 'axios';

axios.default.baseURL = '<https://62584f320c918296a49543e7.mockapi.io>'; 

const fetchTasks = () = async dispatch => {
    // we added async so our code from now on will be asynchronous 
    try {
        const response = await axios.get('/tasks');
    } catch (e) {} // here is behavior of error
};

// The possibility to declare async action creator and operating with asynchronous
// is thans to extension from toolkit name redux-thunk which is default 
// now inside operation we are fetching async action to service three 
// setting the loading indicator, receiving data after a successful 
// request, and handling the error

import axios from 'axios';
import {fetchingInProgress, fetchingSuccess, fetchingError,} from './tasksSlice';

axios default.baseURL = '<https://62584f320c918296a49543e7.mockapi.io>';

export const fetchTasks = () => async dispatch => {
    try {
        // loader 
        dispatch(fetchingInProgress());
        // HTTP request
        const response = await axios.get('/tasks');
        // data processing 
        dispatch(fetchingSuccess(response.data));
    } catch (e) {
        // error processing
        dispatch(fetchingError(e.message));
    }
};

// 5) Now lets add minimal code to call async action generator 

import {useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {fetchTasks} from 'redux/operations';
import {getTasks} from 'redux/selector';

export const App = () => {
    const dispatch = useDispatch();
    // reciving part of state
    const { items, isLoading, error } = useSelector(getTasks);

    // calling operations 
    useEffect(() => {
        dispatch(fetchTasks());
    }, [dispatch]) // we are fetching for tasks only at render dispatch cant change  

    // we are rendering tag depending on request return 
    return (
        <div>
        {isLoading && <p>Loading tasks...</p>}
        {error && <p>{error}</p>}
        <p>{items.lenght > 0 && JSON.stringify(items, null, 2)}</p>
        </div>

    )
}
