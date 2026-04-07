<!-- src/components/TodoItem.vue -->
<template>
  <div class="todo-item" @mouseenter="hover = true" @mouseleave="hover = false">
    <div class="checkbox" :class="{ active: task.completed }" @click="toggle"></div>
    <div class="input-container">
      <input
        ref="input"
        v-model="task.text"
        @blur="checkEmpty"
        :class="{ empty: !task.text, focused: task.isEditing }"
        :disabled="!task.isEditing"
        type="text"
        placeholder="Новая задача..."
      />
    </div>
    <button v-if="hover && !task.isEditing" @click="edit" class="edit-btn">Ред.</button>
    <button v-if="hover && !task.isEditing" @click="remove" class="delete-btn">х</button>
  </div>
</template>

<script>
export default {
  name: 'TodoItem',
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  emits: ['toggle', 'delete', 'edit', 'check-empty'],
  data() {
    return {
      hover: false
    };
  },
  methods: {
    toggle() {
      this.$emit('toggle', this.task.id);
    },
    remove() {
      this.$emit('delete', this.task.id);
    },
    edit() {
      this.$emit('edit', this.task.id);
    },
    checkEmpty() {
      this.$emit('check-empty', this.task.id);
    },
    // Выносим фокус в отдельный метод для переиспользования
    setFocus() {
      this.$nextTick(() => {
        const input = this.$refs.input;
        if (input) {
          input.focus();
        }
      });
    }
  },
  watch: {
    'task.isEditing'(newVal) {
      if (newVal) {
        this.setFocus();
      }
    }
  },
  mounted() {
    // Если задача создаётся уже в режиме редактирования — сразу фокус
    if (this.task.isEditing) {
      this.setFocus();
    }
  }
};
</script>