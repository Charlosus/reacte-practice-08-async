// 1) selectors are function that hermetize reading state from Redux state

import { useSelector } from "react-redux";


const valueSelector = state => state.some.value;

// in components we are using hook useSelector(selector)

const value = useSelector(valueSelector)

// thanks to that komponents are not aware of form of state Redux and 
// process of calculating its value if structur of state would change all
// we need to do is to actualize selector and components will remain unchange 
// this helps with refactorization of code and improve resistance of our aplicaton 

// till now we did not have to think about our selector name 
// however from now on we should name our selector starting with selector 

// BEFOR 

// src/redux/selectors.js

export const getTasks = state => state.tasks.items;

export const getIsLoading = state => state.tasks.isLoading;

export const getError = state => state.tasks.error;

export const getStatusFilter = state => state.filters.status;

// NOW 

export const selectorTasks = state => state.tasks.items;

export const selectorIsLoading = state => state.tasks.isLoading;

export const selectorError = state => state.tasks.error;

export const selectorStatusFilter = state => state.filters.status;

// and we also need to update import names in components file 
//=============== Before ========================
import {
  getTasks,
  getIsLoading,
  getError,
  getStatusFilter,
} from "redux/selectors";

//=============== After ========================
import {
  selectTasks,
  selectIsLoading,
  selectError,
  selectStatusFilter,
} from "redux/selectors";
//========================================================================

// 2) Complexity of selectors

// in simplest forms selectors request state and returns it disired part 

// how ever they are normal functions and beside that we can set 
// different behavior for example to fetch to values and add them together 

const selectorTotalValue = state => {
    const a = state.value.a;
    const b = state.value.b;
    return a + b;
};

// =======================================================================

// 3) In TaskList component we need to calculate task list (duh) that 
// fits actual filter value that was done with getVisibleTasks function 
// can be done by selector hiding logic from component 

// BEFOR

import { useSelector } from "react-redux";
import {selectTask, selectStatusFilter} from 'redux/selectors';
import { statusFilter } from 'redux/constants';

const getVisibleTasks = (tasks, statusFilter) => {
    switch (statusFilter) {
        case statusFilter.active: 
        return tasks.filter(task => !task.completed);
        case statusFilter.completed:
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
};

export const TaskList = () => {
    const tasks = useSelector(selectTasks);
    const statusFilter = useSelector(selectStatusFilter);
    const getVisibleTasks = getVisibleTasks(tasks, statusFilter)
}

// to change that we need for first add selector in selectors.js

import { statusFilters } from "./constants";

export const selectTasks = state => state.tasks.items;
export const selectIsLoading = state => state.tasks.isLoading;
export const selectError = state => state.tasks.error;
export const selectStatusFilter = state => state.filters.status;

export const selectVisibleTasks = state => {
    // here we are using selectors 
    const tasks = selectTasks(state);
    const statusFilter = selectStatusFilter(state);

    switch (statusFilter) {
        case statusFilter.active:
            return tasks.filter(task => !task.completed);
        case statusFilter.completed:
            return tasks.filter(task => task.completed);
        default: 
            return tasks;
    }
};

// selectors that are no doing any calculations are called
// 'simple' selector those are doing some logic on the side we
// called complex selcetors 

// now components TaskList code will be much simples 

// src/components/TaskList/TaskList.jsx

import { useSelector } from "react-redux";
import { selectVisibleTasks } from 'redux/selectors';

export const TaskList = () => {
    const tasks = useSelector(selectVisibleTasks);

    // rest of component
}

//===================================================================

// 4) similar can be done with task counter 

// src/components/TaskCounter/TaskCounter.jsx

import { useSelector } from "react-redux";
import { selectTasks } from 'redux/selectors';

export const TaskCounter = () => {
    const tasks = useSelector(selectTasks);

    const count = tasks.reduce(
        (acc, task) => {
            if (task.completed) {
                acc.completed += 1;
            } else {
                acc.active += 1;
            }
            return acc;
        },
        { active: 0, completed: 0 }
    );
};

//lets do the same with counter 

// src/redux/selectors.js

// rest of selectors 

export const selectTasks = state => state.tasks.items;

export const selectTaskCount = state => {
    const tasks = selectTasks(state);

    return tasks.reduce(
        (count, task) => {
            if (task.completed) {
                count.completed += 1;
            } else {
                count.active += 1;
            }
            return count;
        },
        {active: 0, completed: 0}
    );
};

// now TaskCounter is sparkle clean 

// src/components/TaskCounter/TaskCount.jsx

import { useSelector } from "react-redux";
import {selectTaskCount} from 'redux/selectors';

export const TaskCounter = () => {
    const count = useSelector(selectTaskCount);
};