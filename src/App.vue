<!-- src/App.vue -->
<template>
  <div class="container">
    <!-- Шапка -->
    <Header 
      @add-task="addNewTask"
      @open-auth="openAuthModal" 
      @user-logged-out="onUserLoggedOut"
    />

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
      @update:text="updateTaskText"
    />

    <button @click="addNewTask" class="add-btn">+</button>

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

  <!-- Модальное окно авторизации -->
  <teleport to="body">
  <div v-if="isAuthModalOpen" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <AuthButton @user-logged-out="onUserLoggedOut" @close="closeModal" />
    </div>
  </div>
</teleport>

</template>

<script>
import Header from './components/Header.vue';
import Filters from './components/Filters.vue';
import TodoItem from './components/TodoItem.vue';
import TaskCounter from './components/TaskCounter.vue';
import EmptyState from './components/EmptyState.vue';
import AuthButton from './components/AuthButton.vue';

import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { loadTasksFromCloud, saveTasksToCloud, subscribeToTasks } from './services/taskService';

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
      isDarkMode: false,
      userId: null,
      unsubscribe: null,
      isAuthModalOpen: false // ← для отписки от real-time слушателя
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
      this.saveAndSync();
    },
    toggleTask(id) {
      const task = this.tasks.find(t => t.id === id);
      if (task) {
        task.completed = !task.completed;
        this.saveAndSync();
      }
    },
    deleteTask(id) {
      this.tasks = this.tasks.filter(t => t.id !== id);
      this.saveAndSync();
    },
    checkIfEmpty(id) {
      const task = this.tasks.find(t => t.id === id);
      if (!task) return;
      if (!task.text.trim()) {
        this.deleteTask(id);
      } else {
        task.isEditing = false;
        this.saveAndSync();
      }
    },
    startEditing(id) {
      const task = this.tasks.find(t => t.id === id);
      if (task) task.isEditing = true;
    },
    updateTaskText(id, value) {
      const task = this.tasks.find(t => t.id === id);
      if (task) {
        task.text = value;
        this.saveAndSync();
      }
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
          this.saveAndSync();
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
        return this.tasks;
      }
      return [];
    },
    saveAndSync() {
      this.saveToLocalStorage();
      if (this.userId) {
        saveTasksToCloud(this.userId, this.tasks);
      }
    },
    onUserLoggedOut(shouldClear) {
      if (shouldClear) {
        this.tasks = [];
        localStorage.removeItem('todo-tasks');
      }
      // Если не очищать — задачи останутся в localStorage
    },
    openAuthModal() {
      this.isAuthModalOpen = true;
    },
    closeModal() {
      this.isAuthModalOpen = false;
    }
  },
  mounted() {
    // Загружаем тему
    const savedTheme = localStorage.getItem('dark-theme') === 'true';
    this.isDarkMode = savedTheme;
    document.body.classList.toggle('dark-theme', savedTheme);

    // Загружаем локальные задачи
    this.loadFromLocalStorage();

    // Отслеживаем авторизацию
    onAuthStateChanged(auth, async (user) => {
      // Если был подписан — отписываемся
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }

      if (user) {
        this.userId = user.uid;
        console.log('Пользователь вошёл:', user.email);

        const localTasks = this.loadFromLocalStorage();

        const shouldSync = localTasks.length > 0 &&
                           confirm('Сохранить локальные задачи в облаке?');

        if (shouldSync) {
          await saveTasksToCloud(this.userId, localTasks);
        }

        // Подписываемся на real-time обновления
        this.unsubscribe = subscribeToTasks(this.userId, (cloudTasks) => {
          console.log('Обновление из облака:', cloudTasks);
          this.tasks = cloudTasks;
          this.saveToLocalStorage(); // Синхронизируем локально
        });

      } else {
        console.log('Пользователь вышел');
        this.userId = null;
        this.unsubscribe = null;
      }
    });
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