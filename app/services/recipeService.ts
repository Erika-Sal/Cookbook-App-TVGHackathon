import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import * as FileSystem from 'expo-file-system/legacy';
export interface RecipeData {
  id?: string;
  title: string;
  elderName: string;
  preservedBy: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  prepTime?: string;
  cookTime?: string;
  cuisineOrigin?: string;
  ingredients: string[];
  instructions: string[];
  story?: string;
  culturalContext?: string;
  isPublic: boolean;
  uploadedAt: any;
  userId: string;
  subtitles?: Array<{
    text: string;
    translation?: string;
    start: number;
    end: number;
  }>;
}


export const uploadVideo = async (videoUri: string, recipeId: string): Promise<string> => {
  try {
    console.log('Starting video upload...');
    
    const storageUrl = `https://firebasestorage.googleapis.com/v0/b/hackathoncookingapp.appspot.com/o/recipes%2F${recipeId}%2Fvideo.mp4`;
    
    const uploadResult = await FileSystem.uploadAsync(storageUrl, videoUri, {
      httpMethod: 'POST',
    });
    
    console.log('Upload response:', uploadResult.status);
    
    if (uploadResult.status !== 200) {
      throw new Error(`Upload failed with status ${uploadResult.status}`);
    }
    
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/hackathoncookingapp.appspot.com/o/recipes%2F${recipeId}%2Fvideo.mp4?alt=media`;
    
    return downloadUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const uploadImage = async (imageUri: string, recipeId: string): Promise<string> => {
  try {
    console.log('Starting image upload...');
    
    const storageUrl = `https://firebasestorage.googleapis.com/v0/b/hackathoncookingapp.appspot.com/o/recipes%2F${recipeId}%2Fthumbnail.jpg`;
    
    const uploadResult = await FileSystem.uploadAsync(storageUrl, imageUri, {
      httpMethod: 'POST',
    });
    
    if (uploadResult.status !== 200) {
      throw new Error(`Upload failed with status ${uploadResult.status}`);
    }
    
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/hackathoncookingapp.appspot.com/o/recipes%2F${recipeId}%2Fthumbnail.jpg?alt=media`;
    
    return downloadUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Save complete recipe to Firestore
export const saveRecipe = async (recipeData: Omit<RecipeData, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'recipes'), recipeData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
};

// Get single recipe by ID
export const getRecipeById = async (recipeId: string): Promise<RecipeData | null> => {
  try {
    const docRef = doc(db, 'recipes', recipeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as RecipeData;
    }
    return null;
  } catch (error) {
    console.error('Error getting recipe:', error);
    throw error;
  }
};

// Get user's recipes
export const getUserRecipes = async (userId: string): Promise<RecipeData[]> => {
  try {
    const q = query(
      collection(db, 'recipes'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const recipes: RecipeData[] = [];
    
    querySnapshot.forEach((doc) => {
      recipes.push({
        id: doc.id,
        ...doc.data(),
      } as RecipeData);
    });
    
    return recipes;
  } catch (error) {
    console.error('Error getting recipes:', error);
    throw error;
  }
};

// Get all public recipes
export const getPublicRecipes = async (): Promise<RecipeData[]> => {
  try {
    const q = query(
      collection(db, 'recipes'),
      where('isPublic', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const recipes: RecipeData[] = [];
    
    querySnapshot.forEach((doc) => {
      recipes.push({
        id: doc.id,
        ...doc.data(),
      } as RecipeData);
    });
    
    return recipes;
  } catch (error) {
    console.error('Error getting public recipes:', error);
    throw error;
  }
};