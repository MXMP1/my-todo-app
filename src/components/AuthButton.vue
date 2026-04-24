<!-- src/components/AuthButton.vue -->
<template>
  <div class="auth-container">
    <p v-if="user">Привет, {{ user.email }}</p>
    <button v-if="!user" @click="signInWithGoogle" class="auth-btn google">
      Войти через Google
    </button>
    <button v-if="!user" @click="signInWithEmail" class="auth-btn email">
      Войти по email (ссылка)
    </button>
    <button v-if="user" @click="signOut" class="auth-btn logout">
      Выйти
    </button>
  </div>
</template>

<script>
import { auth } from '../firebaseConfig';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  isSignInWithEmailLink
} from 'firebase/auth';

export default {
  name: 'AuthButton',
  data() {
    return {
      user: null
    };
  },
  methods: {
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        alert('Ошибка входа: ' + error.message);
      }
    },

    async signInWithEmail() {
      const email = prompt('Введите ваш email:');
      if (!email) return;

      const actionCodeSettings = {
        url: 'http://localhost:5173', // ← URL, на который вернётся пользователь (ваше приложение)
        handleCodeInApp: true
      };

      try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        alert(`Ссылка для входа отправлена на ${email}. Перейдите по ней.`);
      } catch (error) {
        alert('Ошибка: ' + error.message);
      }
    },

    async signOut() {
      try {
        await firebaseSignOut(auth);
        alert('Вы вышли');
      } catch (error) {
        alert('Ошибка выхода: ' + error.message);
      }
    }
  },
  mounted() {
    // Отслеживаем состояние авторизации
    onAuthStateChanged(auth, (user) => {
      this.user = user;
      if (user) {
        const email = window.localStorage.getItem('emailForSignIn');
        if (email === user.email) {
          window.localStorage.removeItem('emailForSignIn');
          alert(`Добро пожаловать, ${user.email}!`);
        }
      }
    });

    // Автоматический вход по ссылке
    if (isSignInWithEmailLink(window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = prompt('Введите email, на который была отправлена ссылка:');
      }
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
          })
          .catch((error) => {
            alert('Ошибка подтверждения: ' + error.message);
          });
      }
    }
  }
};
</script>

<style scoped>
.auth-container {
  margin: 10px 0;
  font-size: 14px;
  color: #555;
  display: flex;
  gap: 60px;
}

.auth-btn {
  display: block;
  width: 100%;
  max-width: 240px;
  margin: 8px auto;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.google {
  background: #4285f4;
  color: white;
}

.email {
  background: #34a853;
  color: white;
}

.logout {
  background: #ea4335;
  color: white;
}
</style>