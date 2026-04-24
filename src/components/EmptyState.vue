<!-- src/components/EmptyState.vue -->
<template>
  <div class="empty-state">
    <img
      v-if="!isDarkMode"
      src="../assets/undraw_void.svg"
      alt="Пусто"
      class="empty-image"
    />
    <img
      v-else
      src="../assets/undraw_void.svg"
      alt="Пусто (тёмная тема)"
      class="empty-image"
      :class="{ dark: isDarkMode }"
    />
    <p v-if="tasks.length === 0">У вас пока нет задач</p>
    <p v-else>Нет активных задач</p>
    <button @click="$emit('add-task')">Добавить первую задачу</button>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    tasks: {
      type: Array,
      required: true
    },
    isDarkMode: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #888;
  margin: 20px 0;
}

.empty-image {
  width: 180px;
  height: 180px;
  opacity: 0.6;
  margin-bottom: 20px;
}

p {
  font-size: 16px;
  margin-bottom: 20px;
}

button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #2980b9;
}
</style>