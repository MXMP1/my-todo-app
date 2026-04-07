<!-- src/components/TaskCounter.vue -->
<template>
  <div class="task-counter" :class="{ 'dark-theme': isDarkMode }">
    <p>
      <strong>Всего:</strong> {{ total }}
    </p>
    <p>
        <span class="active">Активных:</span> {{ active }}
    </p>
    <p>
      <span class="completed">Выполнено:</span> {{ completed }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'TaskCounter',
  props: {
    tasks: {
      type: Array,
      required: true
    },
    isDarkMode: {
        type: Boolean,
        required: true
    }
  },
    computed: {
        total() {
            return this.tasks.length;
        },

        active() {
            return this.tasks.filter(t => !t.completed).length;
        },
        
        completed() {
            return this.tasks.filter(t => t.completed).length;
        }
    }
};
</script>

<style scoped>
.task-counter {
  margin: 15px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #555;
  text-align: center;
}

.active {
  color: #163d78;
}

.completed {
  color: #154f23;
}

.task-counter p {
  margin: 4px 0;
}


.task-counter.dark-theme {
  margin: 15px 0;
  padding: 10px;
  background: #232222;
  border-radius: 8px;
  font-size: 14px;
  color: #ffffff;
  text-align: center;
}

.task-counter.dark-theme .active {
  color: #acc4e7;
}

.task-counter.dark-theme .completed {
  color: #9bfab3;
}
</style>