<!-- src/components/Filters.vue -->
<template>
  <div class="filter-section">
    <!-- Фильтр: скрыть завершённые -->
    <label class="toggle-label">
      <input
        type="checkbox"
        :checked="hideCompleted"
        @change="$emit('update:hide-completed', $event.target.checked)"
        class="toggle-checkbox"
      />
      <span class="toggle-switch"></span>
      Скрыть завершённые
    </label>

    <!-- Переключатель темы -->
    <label class="toggle-label">
      <input
        type="checkbox"
        :checked="darkMode"
        @change="$emit('update:dark-mode', $event.target.checked)"
        class="toggle-checkbox"
      />
      <span class="toggle-switch"></span>
      {{ darkMode ? 'Темная тема' : 'Светлая тема' }}
    </label>
  </div>
</template>

<script>
export default {
  name: 'Filters',
  props: {
    hideCompleted: Boolean,
    darkMode: Boolean
  }
};
</script>

<style scoped>
.filter-section {
  display: flex;
  justify-content: space-between;
  margin: 15px 0;
  padding: 0 15px;
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.toggle-checkbox {
  display: none;
}

.toggle-switch {
  width: 40px;
  height: 20px;
  background: #ddd;
  border-radius: 10px;
  margin-right: 8px;
  position: relative;
  transition: background 0.3s;
}

.toggle-switch::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.toggle-checkbox:checked + .toggle-switch {
  background: #3498db;
}

.toggle-checkbox:checked + .toggle-switch::before {
  transform: translateX(20px);
}
</style>