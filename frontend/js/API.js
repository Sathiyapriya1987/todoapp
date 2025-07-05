// ------------------ ↓ GLOBAL VARIABLES ↓ ------------------

const taskForm = document.getElementById("taskForm");
const url = "https://todoapp-323m.onrender.com";
const sortButton = document.getElementById("sortSelect");
const toDoList = document.getElementById("toDoList");
const completedList = document.getElementById("completedList");

// ------------------ ↓ GENERAL FUNCTIONS ↓ ------------------

function resetForm() {
    taskForm.reset();
}

// ------------------ ↓ DOM READY ↓ ------------------

window.addEventListener("DOMContentLoaded", () => {
    sortButton.value = "default";
    displayTasks();
});

// ------------------ ↓ EVENT LISTENERS ↓ ------------------

sortButton.addEventListener("change", () => {
    displayTasks();
});

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    createNewTask();
});

toDoList.addEventListener("click", (event) => {
    if (event.target.classList.contains("done")) {
        completeTask(event.target.getAttribute("data-id"));
    } else if (event.target.classList.contains("edit")) {
        const taskId = event.target.getAttribute("data-id");
        const taskTitle = event.target.getAttribute("data-title");
        const taskDescription = event.target.getAttribute("data-description");
        const taskDueDate = new Date(event.target.getAttribute("data-due-date"));

        const editTaskName = document.getElementById("editTaskName");
        const editTaskDescription = document.getElementById("editTaskDescription");
        const editDueDate = document.getElementById("editDueDate");
        const saveChangesButton = document.getElementById("saveChangesButton");

        editTaskName.value = taskTitle;
        editTaskDescription.value = taskDescription;
        editDueDate.value = taskDueDate.toISOString().split("T")[0];

        saveChangesButton.addEventListener("click", async () => {
            await editTask(taskId);
            bootstrap.Modal.getInstance(document.getElementById("editTaskWindow")).hide();
        }, { once: true });
    }
});

completedList.addEventListener("click", (event) => {
    if (event.target.classList.contains("notDone")) {
        taskNotCompleted(event.target.getAttribute("data-id"));
    }
});

[toDoList, completedList].forEach(list => {
    list.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete")) {
            deleteTask(event.target.getAttribute("data-id"));
        }
    });
});

// ------------------ ↓ TASK FUNCTIONS ↓ ------------------

async function displayTasks() {
    try {
        const sortBy = sortButton.value;
        const query = sortBy !== "default" ? `?sortBy=${sortBy}` : "";

        const response = await fetch(`${url}/tasks${query}`);
        const tasks = await response.json();

        toDoList.innerHTML = "";
        completedList.innerHTML = "";

        tasks.forEach(task => {
            const li = document.createElement("li");
            li.className = "p-3 mt-2 shadow-sm card";

            const created = new Date(task.createOn).toLocaleDateString();
            const due = new Date(task.dueDate).toLocaleDateString();

            if (task.completed) {
                li.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start">
                        <h4 class="col-11 text-decoration-line-through opacity-50">${task.title}</h4>
                        <button data-id="${task._id}" type="button" class="btn-close delete" aria-label="Close"></button>
                    </div>
                    <p class="text-decoration-line-through opacity-50">${task.description}</p>
                    <p class="text-decoration-line-through opacity-50"><strong>Due: </strong>${due}</p>
                    <div class="d-flex justify-content-between align-items-end">
                        <div>
                            <button data-id="${task._id}" class="btn btn-dark shadow-sm notDone">Not done</button>
                        </div>
                        <p class="m-0 text-decoration-line-through opacity-50"><strong>Created on: </strong>${created}</p>
                    </div>`;
                completedList.appendChild(li);
            } else {
                li.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start">
                        <h4 class="col-11">${task.title}</h4>
                        <button data-id="${task._id}" type="button" class="btn-close delete" aria-label="Close"></button>
                    </div>
                    <p>${task.description}</p>
                    <p><strong>Due: </strong>${due}</p>
                    <div class="d-flex justify-content-between align-items-end">
                        <div>
                            <button data-id="${task._id}" data-title="${task.title}" data-description="${task.description}" data-due-date="${task.dueDate}" data-bs-toggle="modal" data-bs-target="#editTaskWindow" class="btn btn-dark shadow-sm edit">Edit</button>
                            <button data-id="${task._id}" class="btn btn-dark shadow-sm done">Done</button>
                        </div>
                        <p class="m-0"><strong>Created on: </strong>${created}</p>
                    </div>`;
                toDoList.appendChild(li);
            }
        });

        resetForm();

    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}

async function createNewTask() {
    const taskDetails = {
        title: document.getElementById("taskName").value.trim(),
        description: document.getElementById("taskDescription").value.trim(),
        dueDate: document.getElementById("dueDate").value.trim()
    };

    if (!taskDetails.title || !taskDetails.description || !taskDetails.dueDate) {
        return alert("All fields required!");
    }

    try {
        const response = await fetch(`${url}/tasks/todo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskDetails)
        });

        if (!response.ok) {
            throw new Error(`Failed to create task: ${response.status}`);
        }

        console.log("New task created", await response.json());
        displayTasks();

    } catch (error) {
        console.error("Error:", error);
    }
}

async function completeTask(taskId) {
    try {
        const response = await fetch(`${url}/tasks/complete/${taskId}`, {
            method: 'PATCH',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: true })
        });

        if (!response.ok) {
            throw new Error(`Failed to complete the task: ${response.status}`);
        }

        console.log("Task completed", await response.json());
        displayTasks();

    } catch (error) {
        console.error("Error:", error);
    }
}

async function taskNotCompleted(taskId) {
    try {
        const response = await fetch(`${url}/tasks/notComplete/${taskId}`, {
            method: 'PATCH',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: false })
        });

        if (!response.ok) {
            throw new Error(`Failed to mark as not complete: ${response.status}`);
        }

        console.log("Task marked not complete", await response.json());
        displayTasks();

    } catch (error) {
        console.error("Error:", error);
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`${url}/tasks/delete/${taskId}`, {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete the task: ${response.status}`);
        }

        console.log("Task deleted", await response.json());
        displayTasks();

    } catch (error) {
        console.error("Error:", error);
    }
}

async function editTask(taskId) {
    const updateDetails = {
        title: document.getElementById('editTaskName').value.trim(),
        description: document.getElementById('editTaskDescription').value.trim(),
        dueDate: document.getElementById('editDueDate').value
    };

    try {
        const response = await fetch(`${url}/tasks/update/${taskId}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateDetails)
        });

        if (!response.ok) {
            throw new Error(`Failed to edit task: ${response.status}`);
        }

        console.log("Edited task:", await response.json());
        displayTasks();

    } catch (error) {
        console.error("Error:", error);
    }
}
