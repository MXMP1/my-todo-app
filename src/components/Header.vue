<!-- src/components/Header.vue -->
<template>
  <div class="header">
    <h1>To-Do List</h1>
    <div class="controls">
      <!-- Кнопка добавления задачи -->
      <!-- <button v-if="!user" class="add-btn" @click="addTask">+</button> -->

      <!-- Приветствие и кнопка выхода -->
      <div v-if="user" class="user-greeting">
        <span>Привет, <strong>{{ user.email }}</strong></span>
        <button @click="signOut" class="logout-btn">Выйти</button>
      </div>

      <!-- Кнопка входа (если не авторизован) -->
      <button v-else class="auth-btn" @click="$emit('open-auth')">Войти</button>
    </div>
  </div>
</template>

<script>
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default {
  name: 'Header',
  data() {
    return {
      user: null
    };
  },
  methods: {
    addTask() {
      this.$emit('add-task');
    },
    async signOut() {
      try {
        const shouldClear = confirm('Очистить все задачи при выходе?');
        
        await auth.signOut();
        alert('Вы вышли');

        // Отправляем событие в App.vue
        this.$emit('user-logged-out', shouldClear);
      } catch (error) {
        alert('Ошибка выхода: ' + error.message);
      }
    }
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      this.user = user;
    });
  }
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  font-size: 24px;
  color: #2c3e50;
  margin: 0;
}

.controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.add-btn {
  background: #3498db;
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn:hover {
  background: #2980b9;
}

.auth-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0 15px;
  height: 40px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.auth-btn:hover {
  background: #2980b9;
}

.user-greeting {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 14px;
  color: #555;
}

.user-greeting strong {
  color: #2c3e50;
}

.logout-btn {
  margin-top: 4px;
  background: #ea4335;
  color: white;
  border: none;
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #d32f2f;
}
</style>