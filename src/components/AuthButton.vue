<!-- src/components/AuthButton.vue -->
<template>
  <div class="auth-container">
    <!-- Форма авторизации (показываем ТОЛЬКО если НЕ авторизован) -->
    <div class="auth-form">
      <h3>{{ isLoginMode ? 'Вход' : 'Регистрация' }}</h3>

      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class="auth-input"
        :class="{ error: emailError }"
        @blur="validateEmail"
      />
      <span v-if="emailError" class="error-message">{{ emailError }}</span>

      <input
        v-model="password"
        type="password"
        placeholder="Пароль (мин. 6 символов)"
        class="auth-input"
        :class="{ error: passwordError }"
        @blur="validatePassword"
        @keyup.enter="submit"
      />
      <span v-if="passwordError" class="error-message">{{ passwordError }}</span>

      <button @click="submit" class="auth-btn submit">
        {{ isLoginMode ? 'Войти' : 'Зарегистрироваться' }}
      </button>

      <button @click="toggleMode" class="toggle-mode-btn">
        {{ isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти' }}
      </button>

      <!-- Google -->
      <button @click="signInWithGoogle" class="auth-btn google">
        Войти через Google
      </button>
    </div>
  </div>
</template>

<script>
import { auth } from '../firebaseConfig';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';

export default {
  name: 'AuthButton',
  data() {
    return {
      // Убрали `user` — больше не отслеживаем здесь!
      isLoginMode: true,
      email: '',
      password: '',
      emailError: '',
      passwordError: ''
    };
  },
  methods: {
    toggleMode() {
      this.isLoginMode = !this.isLoginMode;
      this.clearErrors();
    },

    clearErrors() {
      this.emailError = '';
      this.passwordError = '';
    },

    validateEmail() {
      if (!this.email) {
        this.emailError = 'Email обязателен';
      } else if (!/\S+@\S+\.\S+/.test(this.email)) {
        this.emailError = 'Введите корректный email';
      } else {
        this.emailError = '';
      }
    },

    validatePassword() {
      if (!this.password) {
        this.passwordError = 'Пароль обязателен';
      } else if (this.password.length < 6) {
        this.passwordError = 'Пароль должен быть не менее 6 символов';
      } else {
        this.passwordError = '';
      }
    },

    async submit() {
      this.clearErrors();
      this.validateEmail();
      this.validatePassword();

      if (this.emailError || this.passwordError) return;

      try {
        if (this.isLoginMode) {
          await signInWithEmailAndPassword(auth, this.email, this.password);
          alert(`Добро пожаловать, ${this.email}!`);
        } else {
          await createUserWithEmailAndPassword(auth, this.email, this.password);
          alert(`Аккаунт создан! Добро пожаловать, ${this.email}!`);
        }

        this.closeForm(); // Очищаем поля и закрываем форму после успешной авторизации/регистрации
      } catch (error) {
        if (error.code === 'auth/wrong-password') {
          this.passwordError = 'Неверный пароль';
        } else if (error.code === 'auth/user-not-found') {
          this.emailError = 'Пользователь не найден';
        } else if (error.code === 'auth/email-already-in-use') {
          this.emailError = 'Этот email уже используется';
        } else if (error.code === 'auth/invalid-email') {
          this.emailError = 'Некорректный email';
        } else {
          alert('Ошибка: ' + error.message);
        }
      }
    },

    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
        this.closeForm();
      } catch (error) {
        alert('Ошибка входа: ' + error.message);
      }
    },

    closeForm() {
      this.email = '';
      this.password = '';
      // Закрываем модальное окно через emit, если нужно
      this.$emit('close');
    }
  },
  // Убрали mounted с onAuthStateChanged — пусть Header.vue управляет этим
};
</script>

<style scoped>
.auth-container {
  margin: 10px 0;
  font-size: 14px;
  color: #555;
  max-width: 320px;
  padding: 10px;
}

.user-info {
  text-align: center;
  padding: 10px 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
}

.auth-form h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #2c3e50;
  text-align: center;
}

.auth-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.auth-input.error {
  border-color: #ea4335;
  background-color: #ffeaea;
}

.error-message {
  font-size: 12px;
  color: #ea4335;
  margin-left: 5px;
  height: 14px;
}

.auth-btn {
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: white;
}

.google {
  background: #4285f4;
}

.submit {
  background: #3498db;
}

.logout {
  background: #ea4335;
}

.toggle-mode-btn {
  background: none;
  border: none;
  color: #3498db;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  padding: 5px 0;
}

.toggle-mode-btn:hover {
  color: #2980b9;
}
</style>