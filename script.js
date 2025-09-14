
document.addEventListener('DOMContentLoaded', () => {
    // === DOM要素の取得 ===
    const todoInput = document.getElementById('todo-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const taskCount = document.getElementById('task-count'); // ★ 追加
    const clearCompletedBtn = document.getElementById('clear-completed-btn'); // ★ 追加

    // === アプリケーションの状態 ===
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    // === イベントリスナー ===
    addButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') addTodo();
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentFilter = button.dataset.filter;
            renderTasks();
        });
    });
    
    // 「完了を削除」ボタンのイベントリスナーを追加
    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    });

    // === 関数 ===
    function addTodo() {
        const taskText = todoInput.value.trim();
        if (taskText !== '') {
            tasks.push({ text: taskText, completed: false });
            saveTasks();
            renderTasks();
            todoInput.value = '';
        }
    }

    function toggleTaskCompleted(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }
    
    //  削除処理をアニメーション対応に変更
    function removeTask(index) {
        // 画面上の対応するli要素を取得
        const listItem = todoList.children[index];
        // アニメーション用のクラスを追加
        listItem.classList.add('exit');
        
        // アニメーションが終わるのを待ってから、データ操作と再描画を行う
        setTimeout(() => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        }, 300); // CSSのtransitionの時間と合わせる
    }
    
    function editTask(index, newText) {
        tasks[index].text = newText;
        saveTasks();
        renderTasks();
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    //  メインの描画関数を更新 
    function renderTasks() {
        todoList.innerHTML = '';
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        filteredTasks.forEach(task => {
            const originalIndex = tasks.findIndex(t => t === task);

            const listItem = document.createElement('li');
            listItem.className = 'todo-item';

            const taskSpan = document.createElement('span');
            taskSpan.textContent = task.text;
            if (task.completed) {
                taskSpan.classList.add('completed');
            }
            taskSpan.addEventListener('click', () => toggleTaskCompleted(originalIndex));
            taskSpan.addEventListener('dblclick', () => {
                const editInput = document.createElement('input');
                editInput.type = 'text'; editInput.value = task.text;
                editInput.className = 'edit-input';
                listItem.replaceChild(editInput, taskSpan);
                editInput.focus();
                editInput.addEventListener('blur', () => editTask(originalIndex, editInput.value));
                editInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') editInput.blur(); });
            });

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.textContent = '削除';
            //  削除するタスクのインデックスが変わるので、filteredTasksでのインデックスを渡す
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation(); // 親要素へのイベント伝播を停止
                // 画面上のli要素のインデックスを探す
                const itemToRemove = e.target.closest('li');
                const listItems = Array.from(todoList.children);
                const visualIndex = listItems.indexOf(itemToRemove);
                removeTask(visualIndex);
            });
            
            listItem.appendChild(taskSpan);
            listItem.appendChild(deleteButton);
            todoList.appendChild(listItem);
        });
        
        // タスクカウンターとボタンの表示を更新
        updateSummary();
    }
    
    // UIのサマリー部分を更新する関数
    function updateSummary() {
        const activeTasksCount = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `残り ${activeTasksCount} 件`;
        
        const completedTasksCount = tasks.length - activeTasksCount;
        if (completedTasksCount > 0) {
            clearCompletedBtn.classList.remove('hidden');
        } else {
            clearCompletedBtn.classList.add('hidden');
        }
        
        // フィルターボタンのスタイル更新
        filterButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.filter === currentFilter);
        });
    }

    // === 初期描画 ===
    renderTasks();
});