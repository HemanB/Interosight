import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/config';
import { AuthService } from '../../core/interfaces/auth.interface';
import { User, UserProfile } from '../../core/types/auth.types';

export class FirebaseAuthService implements AuthService {
  async signUp(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Create user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || undefined,
        createdAt: new Date(firebaseUser.metadata.creationTime!),
        lastLoginAt: new Date()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      return userData;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        // Update last login
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...userData,
          lastLoginAt: new Date()
        }, { merge: true });
        return { ...userData, lastLoginAt: new Date() };
      }
      
      throw new Error('User data not found');
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || undefined,
      createdAt: new Date(firebaseUser.metadata.creationTime!),
      lastLoginAt: new Date()
    };
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<User> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('No user logged in');
      
      // Update Firebase Auth profile
      if (updates.displayName) {
        await firebaseUpdateProfile(firebaseUser, {
          displayName: updates.displayName
        });
      }
      
      // Update Firestore user document
      const userRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userRef, updates, { merge: true });
      
      // Get updated user data
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      
      throw new Error('Failed to update profile');
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export const authService = new FirebaseAuthService(); 