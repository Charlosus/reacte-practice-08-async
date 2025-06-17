// 1) To simplify we can use createAsyncThunk() first argument will be 
// type of action an function that should proces http request and 
// returns promise with data which becomes payload value. And then 
// it returns action generator that after initialization will proceeds 
// the function with request code 

import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

axios.defaults.baseURL = "<https://62584f320c918296a49543e7.mockapi.io>";

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async () => {
    const response = await axios.get('/tasks');
    return response.data;
});

// function createAsyncThunk automaticly creates aktions that represens 
// http request cycle 

// THe createAsyncThunk function doesnt create a reducer beacause it cant
// know we want to trace the load state, what data the request will end up
// with, and how to process it correctly. So the next step is to modify
// the tasksSlice code to handle the new actions.

import { createSlice } from '@reduxjs/toolkit';

import {fetchTasks} from './operations';

const tasksSlice = createSlice({
    name: 'tasks',
    initialState: {
        items: [],
        isLoading: false,
        error: null,
    },
    // adding external actions reducer 
    extraReducers: builder => {
        builder
        .addCase(fetchTasks.pending, (state, action) => {})
        .addCase(fetchTasks.fulfilled, (state, action) => {})
        .addCase(fetchTasks.rejected, (state, action) => {})
        },
});

export const tasksReducer = tasksSlice.reducer;
// extraReducer property is used to declare reducers for 'external' action
// types, i.e. those that are not generated from the reducers property 
// Since these reducers support 'exteranl' actions generators in slice.actions will be 
// created for them, this is not nescessary
//======================================================================

// 2) Actions generators that have a request lifecycle are stored in 
// the operation object as pending, fulfilled, and rejected properties
// The are atomaticly created with createAction and therefor have a type 
// property and an overridden toString() method that returns a string of the
// action type.

// We no longer need the reducers property, so we move all the request
// action procession logic to new reducers.

// src/redux/tasksSlice.js

import { createSlice } from '@reduxjs/toolkit';
import {fetchTasks} from "./operations";
import { act } from 'react';

const tasksSlice({
    name: 'tasks',
    initialState: {
        items: [],
        isLoading: false,
        error: null,
    },
    extraReducers: builder => {
        builder
        .addCase(fetchTasks.pending, (state, action) => {
            state.isLoading = true;
        })
        .addCase(fetchTasks.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = null;
            state.items = action.payload;
        })
        .addCase(fetchTasks.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        });
    },
});

export const tasksReducer = tasksSlice.reducer;

// ====================================================================

// 3) Only thing to do is to and processing of request which ends with 
// error to that we need to change fetchTasks so log of error would be 
// return so error actions of request will shows in payload

// src/redux/operations.js

import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.baseURL = "<https://62584f320c918296a49543e7.mockapi.io>";

export const fetchTasks = createAsyncThunk(
    'tasks/fetchAll',
    // here we are using underscore as the name of the first parameter,
    // because we dont need it in this operation
    async (_, thunkAPI) => {
        try {
            const response = await axios.get('tasks')
            // if request would be succesful we will recive promise with data
            return response.data;
        } catch (e) {
            // if request fails, we will return a promise
            // which will be rejected with an error text
            return thunkAPI.rejectWithValue(e.message);
        }
    }
);