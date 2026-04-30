// src/services/taskService.js
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// Получаем ссылку на документ пользователя
const getUserDocRef = (userId) => doc(collection(db, 'users'), userId);

// Загружаем задачи из Firestore
export async function loadTasksFromCloud(userId) {
  try {
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data().tasks || [] : [];
  } catch (error) {
    console.error('Ошибка загрузки из облака:', error);
    throw error;
  }
}

// Сохраняем задачи в Firestore
export async function saveTasksToCloud(userId, tasks) {
  try {
    const userDocRef = getUserDocRef(userId);
    await setDoc(userDocRef, { tasks }, { merge: true });
  } catch (error) {
    console.error('Ошибка сохранения в облако:', error);
    throw error;
  }
}

// Подписываемся на изменения в реальном времени
export function subscribeToTasks(userId, onUpdate) {
  const userDocRef = getUserDocRef(userId);
  
  return onSnapshot(
    userDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const tasks = docSnap.data().tasks || [];
        onUpdate(tasks); // Вызываем колбэк с новыми задачами
      }
    },
    (error) => {
      console.error('Ошибка подписки на задачи:', error);
    }
  );
}