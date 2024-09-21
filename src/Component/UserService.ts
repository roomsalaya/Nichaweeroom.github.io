import { collection, addDoc, setDoc, doc, getDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// การเพิ่มเอกสารใหม่และให้ Firestore สร้าง ID
export const addUser = async (userData: { name: string, email: string, role: string }) => {
    try {
        const docRef = await addDoc(collection(db, 'users'), userData);
        console.log('Document written with ID: ', docRef.id);
    } catch (e) {
        console.error('Error adding document: ', e);
    }
};

// การเพิ่มเอกสารใหม่พร้อมกำหนด ID เอง
export const setUser = async (userId: string, userData: { name: string, email: string, role: string }) => {
    try {
        await setDoc(doc(db, 'users', userId), userData);
        console.log('Document successfully written!');
    } catch (e) {
        console.error('Error adding document: ', e);
    }
};

// การดึงเอกสารเดียวจาก Firestore
export const getUser = async (userId: string) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.log('No such document!');
        return null;
    }
};

// การดึงคอลเลคชันทั้งหมดจาก Firestore
export const getAllUsers = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users: any[] = [];
    querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
    });
    return users;
};

// การอัปเดตเอกสารใน Firestore
export const updateUser = async (userId: string, userData: Partial<{ name: string, email: string, role: string }>) => {
    const userRef = doc(db, 'users', userId);

    try {
        await updateDoc(userRef, userData);
        console.log('Document successfully updated!');
    } catch (e) {
        console.error('Error updating document: ', e);
    }
};

// การลบเอกสารจาก Firestore
export const deleteUser = async (userId: string) => {
    const userRef = doc(db, 'users', userId);

    try {
        await deleteDoc(userRef);
        console.log('Document successfully deleted!');
    } catch (e) {
        console.error('Error removing document: ', e);
    }
};
