<!-- src/App.vue -->
<template>
  <div class="container">
    <!-- Авторизация -->
    <AuthButton />
    
    <!-- Шапка -->
    <Header @add-task="addNewTask" />

    <!-- Фильтры -->
    <Filters
      v-model:hide-completed="hideCompleted"
      v-model:dark-mode="isDarkMode"
    />

    <!-- Список задач -->
    <TodoItem
      v-for="task in filteredTasks"
      :key="task.id"
      :task="task"
      @toggle="toggleTask"
      @delete="deleteTask"
      @edit="startEditing"
      @check-empty="checkIfEmpty"
      @create-next="addNewTask"
    />

    <!-- Счётчик задач -->
   <TaskCounter :tasks="tasks" :is-dark-mode="isDarkMode" />

    <!-- Пустое состояние -->
    <EmptyState
      v-if="tasks.length === 0 || filteredTasks.length === 0"
      :tasks="tasks"
      :is-dark-mode="isDarkMode"
      @add-task="addNewTask"
    />

    <!-- Экспорт и импорт -->
    <div class="controls">
      <button @click="exportTasks">Экспорт задач</button>
      <input
        ref="fileInput"
        type="file"
        @change="importTasks"
        accept=".json"
        style="display: none"
      />
      <button @click="$refs.fileInput.click()">Импорт задач</button>
    </div>
  </div>
</template>

<script>
import Header from './components/Header.vue';
import Filters from './components/Filters.vue';
import TodoItem from './components/TodoItem.vue';
import TaskCounter from './components/TaskCounter.vue';
import EmptyState from './components/EmptyState.vue';
import AuthButton from './components/AuthButton.vue';

import { auth } from './firebaseConfig';
import { signInWithEmailLink } from 'firebase/auth';

export default {
  name: 'App',
  components: {
    Header,
    Filters,
    TodoItem,
    TaskCounter,
    EmptyState,
    AuthButton
  },
  data() {
    return {
      tasks: [],
      hideCompleted: false,
      isDarkMode: false
    };
  },
  computed: {
    filteredTasks() {
      if (this.hideCompleted) {
        return this.tasks.filter(task => !task.completed);
      }
      return this.tasks;
    }
  },
  methods: {
    addNewTask() {
      const newTask = {
        id: Date.now(),
        text: '',
        completed: false,
        isEditing: true
      };
      this.tasks.push(newTask);
    },
    toggleTask(id) {
      const task = this.tasks.find(t => t.id === id);
      if (task) task.completed = !task.completed;
      this.saveToLocalStorage();
    },
    deleteTask(id) {
      this.tasks = this.tasks.filter(t => t.id !== id);
      this.saveToLocalStorage();
    },
    checkIfEmpty(id) {
      const task = this.tasks.find(t => t.id === id);
      if (!task) return;
      if (!task.text.trim()) {
        this.deleteTask(id);
      } else {
        task.isEditing = false;
      }
      this.saveToLocalStorage();
    },
    startEditing(id) {
      const task = this.tasks.find(t => t.id === id);
      if (task) task.isEditing = true;
    },
    exportTasks() {
      const dataStr = JSON.stringify(this.tasks, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'todo-tasks-' + new Date().toISOString().slice(0, 10) + '.json';
      link.click();
      URL.revokeObjectURL(url);
    },
    importTasks(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTasks = JSON.parse(e.target.result);
          this.tasks = importedTasks;
          this.saveToLocalStorage();
          alert('Задачи успешно импортированы!');
        } catch (error) {
          alert('Ошибка при импорте. Некорректный JSON.');
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    saveToLocalStorage() {
      localStorage.setItem('todo-tasks', JSON.stringify(this.tasks));
    },
    loadFromLocalStorage() {
      const saved = localStorage.getItem('todo-tasks');
      if (saved) {
        this.tasks = JSON.parse(saved);
      }
    }
  },
  mounted() {
    this.loadFromLocalStorage();

    const savedTheme = localStorage.getItem('dark-theme') === 'true';
    this.isDarkMode = savedTheme;
    document.body.classList.toggle('dark-theme', savedTheme);
  },
  watch: {
    isDarkMode(newVal) {
      document.body.classList.toggle('dark-theme', newVal);
      localStorage.setItem('dark-theme', newVal);
    }
  }
};
</script>

<style scoped>
@import '../src/assets/style.css';
</style>