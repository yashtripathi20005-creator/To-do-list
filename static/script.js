// static/script.js
document.addEventListener('DOMContentLoaded', () => {
    // ----- DOM refs -----
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const taskCount = document.getElementById('task-count');
    const clearBtn = document.getElementById('clear-btn');

    // ----- State -----
    let tasks = [];

    // ----- Load from localStorage -----
    function loadTasks() {
        const stored = localStorage.getItem('todoList');
        if (stored) {
            try {
                tasks = JSON.parse(stored);
            } catch (e) {
                tasks = [];
            }
        } else {
            // default sample tasks
            tasks = [
                { id: Date.now() + 1, text: 'Welcome to your To-Do list!', completed: false },
                { id: Date.now() + 2, text: 'Click a task to toggle it done', completed: false },
                { id: Date.now() + 3, text: 'Delete tasks with the ✕ button', completed: false },
            ];
        }
        render();
    }

    // ----- Save to localStorage -----
    function saveTasks() {
        localStorage.setItem('todoList', JSON.stringify(tasks));
    }

    // ----- Render -----
    function render() {
        if (tasks.length === 0) {
            taskList.innerHTML = `<li class="empty-message">✨ Nothing here — add a task!</li>`;
            taskCount.textContent = '0 tasks';
            return;
        }

        // Sort: incomplete first, then by id (oldest first)
        const sorted = [...tasks].sort((a, b) => {
            if (a.completed === b.completed) return a.id - b.id;
            return a.completed ? 1 : -1;
        });

        taskList.innerHTML = sorted.map(task => `
            <li class="task-item" data-id="${task.id}">
                <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.text)}</span>
                <button class="delete-btn" aria-label="Delete task">✕</button>
            </li>
        `).join('');

        // Update counter
        const incomplete = tasks.filter(t => !t.completed).length;
        taskCount.textContent = `${incomplete} task${incomplete !== 1 ? 's' : ''}`;

        // ----- Attach event listeners to each task -----
        document.querySelectorAll('.task-item').forEach(item => {
            const id = Number(item.dataset.id);
            const textSpan = item.querySelector('.task-text');
            const deleteBtn = item.querySelector('.delete-btn');

            // Toggle completion on text click
            textSpan.addEventListener('click', () => {
                toggleTask(id);
            });

            // Delete on delete button click
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent triggering toggle
                deleteTask(id);
            });
        });

        saveTasks();
    }

    // ----- Helpers -----
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ----- CRUD operations -----
    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') {
            taskInput.focus();
            return;
        }
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
        };
        tasks.push(newTask);
        taskInput.value = '';
        taskInput.focus();
        render();
    }

    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            render();
        }
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        render();
    }

    function clearAll() {
        if (tasks.length === 0) return;
        if (confirm('Delete all tasks?')) {
            tasks = [];
            render();
        }
    }

    // ----- Event listeners -----
    addBtn.addEventListener('click', addTask);

    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask();
        }
    });

    clearBtn.addEventListener('click', clearAll);

    // ----- Init -----
    loadTasks();
});
