import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

let tasks = [];
let currentFilter = "All";

const form = document.getElementById("form");
const input = document.getElementById("input");
const list = document.getElementById("list");
const loading = document.getElementById("loading");
const counter = document.getElementById("counter");

const tasksCollection = collection(db, "tasks");

function showLoading(message) {
    loading.hidden = false;
    loading.textContent = message;
}

function hideLoading() {
    loading.hidden = true;
}

function renderTasks() {
    let tasksToDisplay = tasks;

    if (currentFilter === "Active") {
        tasksToDisplay = tasks.filter(
            task => !task.completed
        );
    } else if (currentFilter === "Completed") {
        tasksToDisplay = tasks.filter(
            task => task.completed
        );
    }

    list.innerHTML = "";

    if (tasksToDisplay.length === 0) {
        list.innerHTML = `
            <li class="empty-message">
                No tasks found.
            </li>
        `;
    }

    tasksToDisplay.forEach(task => {
        const li = document.createElement("li");

        li.className =
            `item ${task.completed ? "done" : ""}`;

        li.dataset.id = task.id;

        li.innerHTML = `
            <div class="row">

                <input
                    type="checkbox"
                    class="check"
                    ${task.completed ? "checked" : ""}
                    aria-label="Mark task as complete"
                >

                <span class="text"></span>

            </div>

            <div class="actions">

                <button
                    type="button"
                    class="edit"
                    aria-label="Edit task"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="del"
                    aria-label="Delete task"
                >
                    Delete
                </button>

            </div>
        `;

        li.querySelector(".text").textContent =
            task.title;

        list.appendChild(li);
    });

    const activeTasks = tasks.filter(
        task => !task.completed
    ).length;

    counter.textContent =
        `${activeTasks} ${
            activeTasks === 1 ? "task" : "tasks"
        } left`;
}

async function loadTasks() {
    try {
        showLoading("Loading tasks...");

        const tasksQuery = query(
            tasksCollection,
            orderBy("createdAt", "desc")
        );

        const snapshot =
            await getDocs(tasksQuery);

        tasks = snapshot.docs.map(document => ({
            id: document.id,
            ...document.data()
        }));

        renderTasks();

        console.log(
            "Tasks loaded successfully:",
            tasks
        );

    } catch (error) {
        console.error(
            "Error loading tasks:",
            error
        );

        list.innerHTML = `
            <li class="empty-message">
                Sorry, we could not load your tasks.
                Please try again.
            </li>
        `;

    } finally {
        hideLoading();
    }
}

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const taskTitle =
            input.value.trim();

        if (taskTitle === "") {
            alert("Please enter a task.");
            input.focus();
            return;
        }

        if (taskTitle.length > 100) {
            alert(
                "Task must be 100 characters or less."
            );
            input.focus();
            return;
        }

        try {
            showLoading("Adding task...");

            const taskData = {
                title: taskTitle,
                completed: false,
                createdAt: serverTimestamp()
            };

            const documentReference =
                await addDoc(
                    tasksCollection,
                    taskData
                );

            tasks.unshift({
                id: documentReference.id,
                title: taskTitle,
                completed: false,
                createdAt: new Date()
            });

            renderTasks();

            form.reset();
            input.focus();

            console.log(
                "Task added successfully!"
            );

        } catch (error) {
            console.error(
                "Error adding task:",
                error
            );

            alert(
                "Sorry, we could not add your task."
            );

        } finally {
            hideLoading();
        }
    }
);

list.addEventListener(
    "click",
    async (event) => {

        const itemElement =
            event.target.closest(".item");

        if (!itemElement) return;

        const taskId =
            itemElement.dataset.id;

        const taskIndex =
            tasks.findIndex(
                task => task.id === taskId
            );

        if (taskIndex === -1) return;

        if (
            event.target.classList.contains("del")
        ) {

            const taskTitle =
                tasks[taskIndex].title;

            const confirmDelete = confirm(
                `Are you sure you want to delete "${taskTitle}"?`
            );

            if (!confirmDelete) return;

            try {
                showLoading("Deleting task...");

                await deleteDoc(
                    doc(db, "tasks", taskId)
                );

                tasks.splice(
                    taskIndex,
                    1
                );

                renderTasks();

                console.log(
                    "Task deleted successfully!"
                );

            } catch (error) {
                console.error(
                    "Error deleting task:",
                    error
                );

                alert(
                    "Sorry, we could not delete the task."
                );

            } finally {
                hideLoading();
            }
        }

        if (
            event.target.classList.contains("check")
        ) {

            const completed =
                event.target.checked;

            try {
                showLoading(
                    completed
                        ? "Completing task..."
                        : "Updating task..."
                );

                await updateDoc(
                    doc(db, "tasks", taskId),
                    {
                        completed: completed
                    }
                );

                tasks[taskIndex].completed =
                    completed;

                renderTasks();

                console.log(
                    "Task status updated!"
                );

            } catch (error) {
                console.error(
                    "Error updating task:",
                    error
                );

                alert(
                    "Sorry, we could not update the task."
                );

            } finally {
                hideLoading();
            }
        }

        if (
            event.target.classList.contains("edit")
        ) {

            const oldTitle =
                tasks[taskIndex].title;

            const newTitle = prompt(
                "Edit task:",
                oldTitle
            );

            if (newTitle === null) return;

            const trimmedTitle =
                newTitle.trim();

            if (trimmedTitle === "") {
                alert(
                    "Task cannot be empty."
                );
                return;
            }

            if (trimmedTitle.length > 100) {
                alert(
                    "Task must be 100 characters or less."
                );
                return;
            }

            try {
                showLoading("Updating task...");

                await updateDoc(
                    doc(db, "tasks", taskId),
                    {
                        title: trimmedTitle
                    }
                );

                tasks[taskIndex].title =
                    trimmedTitle;

                renderTasks();

                console.log(
                    "Task edited successfully!"
                );

            } catch (error) {
                console.error(
                    "Error editing task:",
                    error
                );

                alert(
                    "Sorry, we could not edit the task."
                );

            } finally {
                hideLoading();
            }
        }
    }
);

const filterButtons =
    document.querySelectorAll(
        ".tabs .btn"
    );

filterButtons.forEach(button => {
    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            currentFilter =
                button.textContent.trim();

            renderTasks();
        }
    );
});

loadTasks();