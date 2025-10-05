import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { saveRecipe, uploadVideo, uploadImage } from '../services/recipeService';
import { Timestamp } from 'firebase/firestore';

type ParsedRecipe = {
  title: string;
  prepTime: string;
  cookTime: string;
  cuisineOrigin: string;
  elderName: string;
  ingredients: string[];
  instructions: string[];
  story: string;
  culturalContext: string;
};

type Subtitle = {
  text: string;
  translation?: string;
  start: number;
  end: number;
};

export default function UploadRecipeScreen() {
  const router = useRouter();
  const [uploadMethod, setUploadMethod] = useState<'none' | 'image' | 'video' | 'manual'>('none');
  const [recipeImage, setRecipeImage] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [currentTranslation, setCurrentTranslation] = useState<string>('');
  const [isPublic, setIsPublic] = useState(true); // Add this for public/private toggle
  
  const [recipe, setRecipe] = useState<ParsedRecipe>({
    title: '',
    prepTime: '',
    cookTime: '',
    cuisineOrigin: '',
    elderName: '',
    ingredients: [''],
    instructions: [''],
    story: '',
    culturalContext: '',
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setRecipeImage(result.assets[0].uri);
      setUploadMethod('image');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setRecipeImage(result.assets[0].uri);
      setUploadMethod('image');
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your videos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
      setUploadMethod('video');
      await transcribeVideo(result.assets[0].uri);
    }
  };

  const transcribeVideo = async (videoUri: string) => {
    setIsTranscribing(true);
    try {
      const ASSEMBLYAI_API_KEY = '32bb854f967c4e1a8e2286d8020b6d15';
      
      console.log('📤 Uploading video...');
      
      const videoBlob = await fetch(videoUri).then(r => r.blob());
      
      const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
        method: 'POST',
        headers: {
          'authorization': ASSEMBLYAI_API_KEY,
        },
        body: videoBlob,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Upload failed:', errorText);
        
        if (uploadResponse.status === 401) {
          throw new Error('Invalid API key. Get one from https://www.assemblyai.com/');
        }
        throw new Error(`Upload failed: ${errorText}`);
      }

      const { upload_url } = await uploadResponse.json();
      console.log('✅ Upload successful');

      console.log('🎙️ Starting transcription...');
      
      const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
          'authorization': ASSEMBLYAI_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: upload_url,
          language_code: 'es',
        }),
      });

      const { id: transcriptId } = await transcriptResponse.json();
      console.log('⏳ Transcription ID:', transcriptId);

      let transcript: any = null;
      let attempts = 0;
      
      while (attempts < 60) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const pollingResponse = await fetch(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          {
            headers: {
              'authorization': ASSEMBLYAI_API_KEY,
            },
          }
        );

        transcript = await pollingResponse.json();
        console.log(`📊 Status: ${transcript.status}`);

        if (transcript.status === 'completed') {
          break;
        } else if (transcript.status === 'error') {
          throw new Error(`Transcription error: ${transcript.error}`);
        }
        
        attempts++;
      }

      if (transcript?.status !== 'completed') {
        throw new Error('Transcription timeout');
      }

      // Get Spanish words
      const spanishWords = transcript.words || [];
      
      // Group words into phrases (every 3-5 words) for better translation
      const phrases = [];
      const WORDS_PER_PHRASE = 4;
      
      for (let i = 0; i < spanishWords.length; i += WORDS_PER_PHRASE) {
        const phraseWords = spanishWords.slice(i, i + WORDS_PER_PHRASE);
        phrases.push(phraseWords);
      }
      
      console.log(`Translating ${phrases.length} phrases...`);
      
      // Translate each phrase
      const translatedPhrases = await Promise.all(
        phrases.map(async (phraseWords) => {
          const spanishPhrase = phraseWords.map((w: any) => w.text).join(' ');
          const englishPhrase = await translateText(spanishPhrase, 'es', 'en');
          const englishWords = englishPhrase.split(/\s+/);
          
          // Map English words back to Spanish word timings
          return phraseWords.map((word: any, idx: number) => ({
            text: word.text,
            translation: englishWords[idx] || englishWords[englishWords.length - 1],
            start: word.start / 1000,
            end: word.end / 1000,
          }));
        })
      );
      
      // Flatten the array
      const subs: Subtitle[] = translatedPhrases.flat();
      
      console.log('Sample subtitle:', subs[0]);

      setSubtitles(subs);
      console.log(`✅ Generated ${subs.length} dual-language subtitles`);
      
      Alert.alert('Success!', 'Video transcribed with Spanish & English subtitles!');

    } catch (error: unknown) {
      console.error('❌ Error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Could not transcribe video';
      Alert.alert('Transcription Error', errorMessage);
    } finally {
      setIsTranscribing(false);
    }
  };

  const translateText = async (text: string, from: string, to: string): Promise<string> => {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      const json = await response.json();
      const translated = json[0].map((item: any) => item[0]).join('');
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.isPlaying && subtitles.length > 0) {
      const currentTime = status.positionMillis / 1000;
      
      // Find current words within a small time window (±0.3s for phrase grouping)
      const currentWords = subtitles.filter(
        (sub: Subtitle) => currentTime >= (sub.start - 0.1) && currentTime <= (sub.end + 0.3)
      );
      
      if (currentWords.length > 0) {
        // Group Spanish words into phrase
        const spanishPhrase = currentWords.map((w: Subtitle) => w.text).join(' ');
        setCurrentSubtitle(spanishPhrase);
        
        // Group English translations into phrase
        const englishPhrase = currentWords.map((w: Subtitle) => w.translation).join(' ');
        setCurrentTranslation(englishPhrase);
      } else {
        setCurrentSubtitle('');
        setCurrentTranslation('');
      }
    }
  };

  const addIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ''],
    }));
  };

  const removeIngredient = (index: number) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === index ? value : ing),
    }));
  };

  const addInstruction = () => {
    setRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, ''],
    }));
  };

  const removeInstruction = (index: number) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst),
    }));
  };

  const submitRecipe = async () => {
  if (!recipe.title || !recipe.elderName) {
    Alert.alert('Missing Information', 'Please fill in at least the recipe title and elder name');
    return;
  }

  try {
    setIsParsing(true);
    
    const recipeId = Date.now().toString();
    
    // For now, just save local URIs (not uploaded to cloud)
    const recipeData = {
      title: recipe.title,
      elderName: recipe.elderName,
      preservedBy: 'currentUser',
      videoUrl: videoUri || '', // Local URI for now
      thumbnailUrl: recipeImage || '', // Local URI for now
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      cuisineOrigin: recipe.cuisineOrigin,
      ingredients: recipe.ingredients.filter(i => i.trim() !== ''),
      instructions: recipe.instructions.filter(i => i.trim() !== ''),
      story: recipe.story,
      culturalContext: recipe.culturalContext,
      isPublic: isPublic,
      userId: 'tempUserId',
      uploadedAt: Timestamp.now(),
      subtitles: subtitles,
    };
    
    console.log('Saving recipe to Firestore...');
    const savedRecipeId = await saveRecipe(recipeData);
    console.log('Recipe saved with ID:', savedRecipeId);
    
    Alert.alert('Success!', 'Recipe saved successfully', [
      { text: 'View My Recipes', onPress: () => router.push('/(tabs)/profile' as any) }
    ]);
    
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    Alert.alert('Upload Failed', errorMessage);
  } finally {
    setIsParsing(false);
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Recipe</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {uploadMethod === 'none' && (
          <View style={styles.uploadOptions}>
            <Text style={styles.sectionTitle}>How would you like to add this recipe?</Text>
            
            <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
              <Text style={styles.uploadButtonIcon}>📷</Text>
              <View>
                <Text style={styles.uploadButtonTitle}>Take Photo</Text>
                <Text style={styles.uploadButtonSubtitle}>Snap a picture of the recipe card</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadButtonIcon}>🖼️</Text>
              <View>
                <Text style={styles.uploadButtonTitle}>Upload Image</Text>
                <Text style={styles.uploadButtonSubtitle}>Choose from your photo library</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
              <Text style={styles.uploadButtonIcon}>🎥</Text>
              <View>
                <Text style={styles.uploadButtonTitle}>Upload Video Tutorial</Text>
                <Text style={styles.uploadButtonSubtitle}>Record your elder teaching the recipe</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.uploadButton, styles.manualButton]} 
              onPress={() => setUploadMethod('manual')}
            >
              <Text style={styles.uploadButtonIcon}>✏️</Text>
              <View>
                <Text style={styles.uploadButtonTitle}>Enter Manually</Text>
                <Text style={styles.uploadButtonSubtitle}>Type in the recipe details</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {isTranscribing && (
          <View style={styles.parsingContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.parsingText}>Transcribing & Translating Video...</Text>
            <Text style={styles.parsingSubtext}>This may take 2-5 minutes</Text>
          </View>
        )}

        {(uploadMethod !== 'none' && !isTranscribing) && (
          <View style={styles.form}>
            {recipeImage && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: recipeImage }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.changeImageButton}
                  onPress={pickImage}
                >
                  <Text style={styles.changeImageText}>Change Image</Text>
                </TouchableOpacity>
              </View>
            )}

            {videoUri && (
              <View style={styles.previewContainer}>
                <View style={styles.videoContainer}>
                  <Video
                    source={{ uri: videoUri }}
                    style={styles.videoPlayer}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                  />
                  {currentSubtitle !== '' && (
                    <View style={styles.subtitleOverlay}>
                      <Text style={styles.subtitleTextSpanish}>{currentSubtitle}</Text>
                      {currentTranslation && (
                        <Text style={styles.subtitleTextEnglish}>
                          {currentTranslation}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.changeImageButton}
                  onPress={pickVideo}
                >
                  <Text style={styles.changeImageText}>Change Video</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.label}>Recipe Title *</Text>
              <TextInput
                style={styles.input}
                value={recipe.title}
                onChangeText={(text) => setRecipe(prev => ({ ...prev, title: text }))}
                placeholder="e.g., Grandma's Apple Pie"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Elder's Name *</Text>
              <TextInput
                style={styles.input}
                value={recipe.elderName}
                onChangeText={(text) => setRecipe(prev => ({ ...prev, elderName: text }))}
                placeholder="e.g., Grandma Betty"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.rowSection}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Prep Time</Text>
                <TextInput
                  style={styles.input}
                  value={recipe.prepTime}
                  onChangeText={(text) => setRecipe(prev => ({ ...prev, prepTime: text }))}
                  placeholder="20 min"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Cook Time</Text>
                <TextInput
                  style={styles.input}
                  value={recipe.cookTime}
                  onChangeText={(text) => setRecipe(prev => ({ ...prev, cookTime: text }))}
                  placeholder="40 min"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Cuisine Origin</Text>
              <TextInput
                style={styles.input}
                value={recipe.cuisineOrigin}
                onChangeText={(text) => setRecipe(prev => ({ ...prev, cuisineOrigin: text }))}
                placeholder="e.g., Italian, Mexican, Vietnamese"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.listItemContainer}>
                  <TextInput
                    style={[styles.input, styles.listInput]}
                    value={ingredient}
                    onChangeText={(text) => updateIngredient(index, text)}
                    placeholder={`Ingredient ${index + 1}`}
                    placeholderTextColor="#9CA3AF"
                  />
                  {recipe.ingredients.length > 1 && (
                    <TouchableOpacity 
                      onPress={() => removeIngredient(index)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
                <Text style={styles.addButtonText}>+ Add Ingredient</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              {recipe.instructions.map((instruction, index) => (
                <View key={index} style={styles.listItemContainer}>
                  <Text style={styles.stepNumber}>{index + 1}.</Text>
                  <TextInput
                    style={[styles.input, styles.listInput, styles.instructionInput]}
                    value={instruction}
                    onChangeText={(text) => updateInstruction(index, text)}
                    placeholder={`Step ${index + 1}`}
                    placeholderTextColor="#9CA3AF"
                    multiline
                  />
                  {recipe.instructions.length > 1 && (
                    <TouchableOpacity 
                      onPress={() => removeInstruction(index)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={addInstruction}>
                <Text style={styles.addButtonText}>+ Add Step</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>The Story</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={recipe.story}
                onChangeText={(text) => setRecipe(prev => ({ ...prev, story: text }))}
                placeholder="Share the story behind this recipe..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cultural Context</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={recipe.culturalContext}
                onChangeText={(text) => setRecipe(prev => ({ ...prev, culturalContext: text }))}
                placeholder="Any cultural significance or traditions..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Visibility</Text>
              <View style={styles.visibilityToggle}>
                <TouchableOpacity
                  style={[
                    styles.visibilityButton,
                    isPublic && styles.visibilityButtonActive
                  ]}
                  onPress={() => setIsPublic(true)}
                >
                  <Text style={[
                    styles.visibilityButtonText,
                    isPublic && styles.visibilityButtonTextActive
                  ]}>
                    🌍 Public
                  </Text>
                  <Text style={styles.visibilitySubtext}>
                    Anyone can see this recipe
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.visibilityButton,
                    !isPublic && styles.visibilityButtonActive
                  ]}
                  onPress={() => setIsPublic(false)}
                >
                  <Text style={[
                    styles.visibilityButtonText,
                    !isPublic && styles.visibilityButtonTextActive
                  ]}>
                    🔒 Private
                  </Text>
                  <Text style={styles.visibilitySubtext}>
                    Only you can see this
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={submitRecipe}>
              <Text style={styles.submitButtonText}>Post Recipe</Text>
            </TouchableOpacity>

            <View style={{ height: 100 }} />
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.push('/(tabs)' as any)}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>➕</Text>
          <Text style={styles.navTextActive}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>❤️</Text>
          <Text style={styles.navText}>Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
  },
  backButton: {
    fontSize: 24,
    color: '#4B5563',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  uploadOptions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#86A952',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  manualButton: {
    borderColor: '#059669',
    borderStyle: 'dashed',
  },
  uploadButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  uploadButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  uploadButtonSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  parsingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  parsingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  parsingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  form: {
    padding: 20,
  },
  previewContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  videoContainer: {
    width: '100%',
    height: 500,
    position: 'relative',
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  subtitleOverlay: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 16,
    borderRadius: 12,
  },
  subtitleTextSpanish: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitleTextEnglish: {
    color: '#A3D977',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  changeImageButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#059669',
    borderRadius: 8,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  rowSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    width: 24,
  },
  listInput: {
    flex: 1,
  },
  instructionInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  removeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#86A952',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#059669',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: '#059669',
    paddingVertical: 8,
    paddingBottom: 20,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  navText: {
    fontSize: 11,
    color: '#6B7280',
  },
  navTextActive: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  visibilityToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  visibilityButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  visibilityButtonActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  visibilityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  visibilityButtonTextActive: {
    color: '#059669',
  },
  visibilitySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});