<!-- src/components/Header.vue -->
<template>
  <div class="header">
    <h1>To-Do List</h1>
    <button class="add-btn" @click="addTask">+</button>
  </div>
</template>

<script>
export default {
  name: 'Header',
  methods: {
    addTask() {
      this.$emit('add-task');
    }
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

.add-btn {
  background: #3498db;
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn:hover {
  background: #2980b9;
}
</style>