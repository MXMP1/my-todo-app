// src/services/taskService.js
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

const TASKS_COLLECTION = 'users';
const TASKS_DOC = (userId) => `tasks_${userId}`;

// Загружаем задачи из Firestore
export async function loadTasksFromCloud(userId) {
  try {
    const userDocRef = doc(collection(db, TASKS_COLLECTION), userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.tasks || [];
    }
    return [];
  } catch (error) {
    console.error('Ошибка загрузки из облака:', error);
    throw error;
  }
}

// Сохраняем задачи в Firestore
export async function saveTasksToCloud(userId, tasks) {
  try {
    const userDocRef = doc(collection(db, TASKS_COLLECTION), userId);
    await setDoc(userDocRef, { tasks }, { merge: true });
  } catch (error) {
    console.error('Ошибка сохранения в облако:', error);
    throw error;
  }
}