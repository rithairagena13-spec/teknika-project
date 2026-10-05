//  LOCAL DATA MODEL (OUR SOURCE OF TRUTH IN MEMORY)
let tasks = [
    { id: "t1", title: "Learn HTML", completed: false },
    { id: "t2", title: "Create folder", completed: true },
    { id: "t3", title: "Read rules", completed: false }
];

// 🔗 CONNECTING TO OUR HTML ELEMENTS
const form = document.getElementById("form");
const input = document.getElementById("input");
const list = document.getElementById("list");
const counter = document.getElementById("counter");

console.log("TaskFlow engine loaded successfully!", tasks);

// DISPLAY ENGINE: RENDER TASKS FROM MEMORY TO THE SCREEN
function renderTasks() {
    list.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = `item ${task.completed ? "done" : ""}`;
        
        li.innerHTML = `
            <div class="row">
                <input type="checkbox" class="check" ${task.completed ? "checked" : ""}>
                <span class="text"></span>
            </div>
            <div class="actions">
                <button class="edit">Edit</button>
                <button class="del">Delete</button>
            </div>
        `;

        li.querySelector(".text").textContent = task.title;
        list.appendChild(li);
    });

    const activeTasks = tasks.filter(t => !t.completed).length;
    counter.textContent = `${activeTasks} left`;
}

// Run the engine instantly when the script loads to draw our array items
renderTasks();


// ➕ ADD TASK FUNCTIONALITY
form.addEventListener("submit", (event) => {
    // Stop the page from refreshing automatically
    event.preventDefault();

    // Get the typed text and remove extra spaces at the ends
    const taskTitle = input.value.trim();

    // Validation: Reject empty text or spaces
    if (taskTitle === "") {
        alert("Task cannot be empty!");
        return;
    }

    // Create a new task object with a simple timestamp ID
    const newTask = {
        id: "t_" + Date.now(),
        title: taskTitle,
        completed: false
    };

    // Add the new object to the front of our array list
    tasks.unshift(newTask);

    // Re-render the screen to show the new item instantly
    renderTasks();

    // Clear out the input field text box for the next task
    form.reset();
});


// ⚡ EVENT DELEGATION LISTENER (HANDLES CHECKBOX & DELETE CLICKS)
list.addEventListener("click", (event) => {
    // 1. FIND THE EXACT CURRENT CARD ITEM LI COMPONENT BEING CLICKED
    const itemElement = event.target.closest(".item");
    if (!itemElement) return;

    // Find the text title of this task so we know which one to look for
    const taskTitle = itemElement.querySelector(".text").textContent;
    
    // Find the index location position of this task inside our array structure
    const taskIndex = tasks.findIndex(t => t.title === taskTitle);

    // 🗑️ CASE A: IF THE USER CLICKED THE DELETE BUTTON ELEMENT
    if (event.target.classList.contains("del")) {
        // Ask for standard system confirmation as requested in your brief guidelines
        const confirmDelete = confirm(`Are you sure you want to delete "${taskTitle}"?`);
        
        if (confirmDelete) {
            // Remove the targeted item from our local array memory channel
            tasks.splice(taskIndex, 1);
            // Re-render the screen to update layout tracks and counter fields instantly
            renderTasks();
        }
    }

    // ⬜ CASE B: IF THE USER TOGGLED THE COMPLETION STATUS CHECKBOX ELEMENT
    if (event.target.classList.contains("check")) {
        // Invert the completed true/false value flag inside our data model array row
        tasks[taskIndex].completed = event.target.checked;
        // Re-render the screen to update strikethroughs and active totals immediately
        renderTasks();
    }
});
