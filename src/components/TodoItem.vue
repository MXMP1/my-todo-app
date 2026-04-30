<!-- src/components/TodoItem.vue -->
<template>
  <div 
    class="todo-item"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="checkbox" :class="{ active: task.completed }" @click="toggle"></div>
    <div class="input-container">
      <input
        ref="input"
        v-model="task.text"
        @blur="checkEmpty"
        @keyup.enter="onEnter"
        @keyup.esc="cancelEdit"
        :class="{ empty: !task.text, focused: task.isEditing }"
        :disabled="!task.isEditing"
        type="text"
        placeholder="Новая задача..."
      />
    </div>
    <button v-if="hover && !task.isEditing" @click="edit" class="edit-btn">Ред.</button>
    <button v-if="hover && !task.isEditing" @click="remove" class="delete-btn">×</button>
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
  emits: [
    'toggle',
    'delete',
    'edit',
    'check-empty',
    'create-next',
    'update:text'
  ],
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
    
    // При нажатии Enter — сохранить + создать новую
    onEnter() {
      if (!this.task.text.trim()) {
        this.$emit('delete', this.task.id);
      } else {
        this.$emit('check-empty', this.task.id);
        this.$emit('create-next');
      }
    },

    // При потере фокуса
    checkEmpty() {
      this.$emit('check-empty', this.task.id);
    },

    // При Esc
    cancelEdit() {
      if (!this.task.isEditing) return;

      if (!this.task.text.trim()) {
        this.$emit('delete', this.task.id);
      } else {
        this.$emit('check-empty', this.task.id);
      }
    },

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
    if (this.task.isEditing) {
      this.setFocus();
    }
  }
};
</script>