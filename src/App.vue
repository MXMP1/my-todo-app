<!-- src/App.vue -->
<template>
  <div class="container">
    <h1>To-Do List</h1>

    <!-- Кнопка добавления задачи -->
    <div class="add-btn">
      <button @click="addNewTask">+</button>
    </div>

    <!-- Фильтры: скрыть завершённые и тема -->
    <div class="filter-section">
      <label class="toggle-label">
        <input type="checkbox" v-model="hideCompleted" class="toggle-checkbox">
        <span class="toggle-switch"></span>
        Скрыть завершённые
      </label>

      <label class="toggle-label">
        <input type="checkbox" v-model="isDarkMode" class="toggle-checkbox">
        <span class="toggle-switch"></span>
        {{ isDarkMode ? 'Темная тема' : 'Светлая тема' }}
      </label>
    </div>

    <!-- Список задач -->
    <TodoItem
      v-for="task in filteredTasks"
      :key="task.id"
      :task="task"
      @toggle="toggleTask"
      @delete="deleteTask"
      @edit="startEditing"
      @check-empty="checkIfEmpty"
    />

    <p>Количество задач: {{ currentTasksCount }}</p>

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
import TodoItem from './components/TodoItem.vue';

export default {
  name: 'App',
  components: { TodoItem },
  data() {
    return {
      tasks: [],
      hideCompleted: false,
      isDarkMode: false,
    };
  },
  computed: {
    filteredTasks() {
      if (this.hideCompleted) {
        return this.tasks.filter(task => !task.completed);
      }
      return this.tasks;
    },
    currentTasksCount() {
      return this.tasks.length;
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

      this.$nextTick(() => {
      // Но фокус установится автоматически благодаря watch в TodoItem
      });
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
      event.target.value = ''; // сбросить файл
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

    // Тема
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
/* Скопируем стили из style.css, но немного адаптируем */
@import '../src/assets/style.css';
</style>