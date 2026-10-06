
// FIREBASE IMPORTS


import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";



// FIREBASE CONFIGURATION


const firebaseConfig = {
    apiKey: "REMOVED_API_KEY",
    authDomain: "taskflow-app-5b420.firebaseapp.com",
    projectId: "taskflow-app-5b420",
    storageBucket: "taskflow-app-5b420.firebasestorage.app",
    messagingSenderId: "941988575431",
    appId: "1:941988575431:web:5dffb053724685791766e2"
};



// INITIALIZE FIREBASE


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const tasksCollection = collection(db, "tasks");


// LOCAL DATA MODEL


let tasks = [];



// CONNECT TO HTML ELEMENTS


const form = document.getElementById("form");
const input = document.getElementById("input");
const list = document.getElementById("list");
const counter = document.getElementById("counter");



// RENDER TASKS


function renderTasks() {

    // Clear the current list
    list.innerHTML = "";


    // Create each task
    tasks.forEach(task => {

        const li = document.createElement("li");

        // Add task classes
        li.className = `item ${task.completed ? "done" : ""}`;

        // Store Firestore document ID
        li.dataset.id = task.id;


        // Create task HTML
        li.innerHTML = `
            <div class="row">

                <input
                    type="checkbox"
                    class="check"
                    ${task.completed ? "checked" : ""}
                >

                <span class="text"></span>

            </div>

            <div class="actions">

                <button class="edit">
                    Edit
                </button>

                <button class="del">
                    Delete
                </button>

            </div>
        `;


        // Add task title safely
        li.querySelector(".text").textContent = task.title;


        // Add task to the page
        list.appendChild(li);

    });


    // Count unfinished tasks
    const activeTasks = tasks.filter(
        task => !task.completed
    ).length;


    // Update counter
    counter.textContent = `${activeTasks} left`;
}



// LOAD TASKS FROM FIRESTORE


async function loadTasks() {

    try {

        // Get all documents from tasks collection
        const snapshot = await getDocs(tasksCollection);


        // Convert Firestore documents into JavaScript objects
        tasks = snapshot.docs.map(document => ({

            id: document.id,

            ...document.data()

        }));


        // Display tasks
        renderTasks();


        console.log("Tasks loaded successfully:", tasks);

    } catch (error) {

        console.error("Error loading tasks:", error);

        alert("Could not load tasks from Firebase.");

    }
}



// ADD NEW TASK


form.addEventListener("submit", async (event) => {

    // Prevent page refresh
    event.preventDefault();


    // Get task text
    const taskTitle = input.value.trim();


    // Check if empty
    if (taskTitle === "") {

        alert("Task cannot be empty!");

        return;
    }


    try {

        // Create task data
        const taskData = {

            title: taskTitle,

            completed: false

        };


        // Save task to Firestore
        const documentReference = await addDoc(
            tasksCollection,
            taskData
        );


        // Add task to local array
        tasks.unshift({

            id: documentReference.id,

            ...taskData

        });


        // Update screen
        renderTasks();


        // Clear input
        form.reset();


        console.log("Task added successfully!");

    } catch (error) {

        console.error("Error adding task:", error);

        alert("Could not add task.");

    }

});



// TASK ACTIONS
// DELETE / COMPLETE / EDIT


list.addEventListener("click", async (event) => {

    // Find the task element
    const itemElement = event.target.closest(".item");


    // Stop if nothing was clicked
    if (!itemElement) return;


    // Get Firestore document ID
    const taskId = itemElement.dataset.id;


    // Find task in local array
    const taskIndex = tasks.findIndex(
        task => task.id === taskId
    );


    // Stop if task doesn't exist
    if (taskIndex === -1) return;


    
    // DELETE TASK
   

    if (event.target.classList.contains("del")) {

        const taskTitle = tasks[taskIndex].title;


        // Confirmation message
        const confirmDelete = confirm(
            `Are you sure you want to delete "${taskTitle}"?`
        );


        if (!confirmDelete) return;


        try {

            // Delete from Firestore
            await deleteDoc(
                doc(db, "tasks", taskId)
            );


            // Delete from local array
            tasks.splice(taskIndex, 1);


            // Update screen
            renderTasks();


            console.log("Task deleted successfully!");

        } catch (error) {

            console.error("Error deleting task:", error);

            alert("Could not delete task.");

        }

    }


   
    // COMPLETE TASK
   

    if (event.target.classList.contains("check")) {

        const completed = event.target.checked;


        try {

            // Update Firestore
            await updateDoc(
                doc(db, "tasks", taskId),
                {
                    completed: completed
                }
            );


            // Update local array
            tasks[taskIndex].completed = completed;


            // Update screen
            renderTasks();


            console.log("Task status updated!");

        } catch (error) {

            console.error("Error updating task:", error);

            alert("Could not update task.");

        }

    }


    // EDIT TASK
    

    if (event.target.classList.contains("edit")) {

        const oldTitle = tasks[taskIndex].title;


        // Ask for new title
        const newTitle = prompt(
            "Edit task:",
            oldTitle
        );


        // User pressed Cancel
        if (newTitle === null) return;


        // Remove extra spaces
        const trimmedTitle = newTitle.trim();


        // Check empty title
        if (trimmedTitle === "") {

            alert("Task cannot be empty!");

            return;
        }


        try {

            // Update Firestore
            await updateDoc(
                doc(db, "tasks", taskId),
                {
                    title: trimmedTitle
                }
            );


            // Update local array
            tasks[taskIndex].title = trimmedTitle;


            // Update screen
            renderTasks();


            console.log("Task edited successfully!");

        } catch (error) {

            console.error("Error editing task:", error);

            alert("Could not edit task.");

        }

    }

});


// FILTER BUTTONS


const filterButtons = document.querySelectorAll(".tabs .btn");


filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Remove active class from all buttons
        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });


        // Add active class to clicked button
        button.classList.add("active");


        // Get selected filter
        const filter = button.textContent.trim();


        // Filter tasks
        if (filter === "All") {

            renderTasks();

        }

        else if (filter === "Active") {

            renderFilteredTasks(
                tasks.filter(task => !task.completed)
            );

        }

        else if (filter === "Done") {

            renderFilteredTasks(
                tasks.filter(task => task.completed)
            );

        }

    });

});


// =====================================
// RENDER FILTERED TASKS
// =====================================

function renderFilteredTasks(filteredTasks) {

    list.innerHTML = "";


    filteredTasks.forEach(task => {

        const li = document.createElement("li");

        li.className = `item ${task.completed ? "done" : ""}`;

        li.dataset.id = task.id;


        li.innerHTML = `
            <div class="row">

                <input
                    type="checkbox"
                    class="check"
                    ${task.completed ? "checked" : ""}
                >

                <span class="text"></span>

            </div>

            <div class="actions">

                <button class="edit">
                    Edit
                </button>

                <button class="del">
                    Delete
                </button>

            </div>
        `;


        li.querySelector(".text").textContent = task.title;

        list.appendChild(li);

    });

}



// START TASKFLOW


loadTasks();