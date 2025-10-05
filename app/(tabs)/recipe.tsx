import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useShoppingList } from '../context/ShoppingContext';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { askRecipeQuestion } from '../services/recipeAI';

const { width } = Dimensions.get('window');

type Ingredient = {
  id: number;
  name: string;
};

type Subtitle = {
  text: string;
  translation?: string;
  start: number;
  end: number;
};

type Recipe = {
  title: string;
  videoUrl: string | null;
  imageUrl: string;
  elderName: string;
  preservedBy: string;
  prepTime: string;
  servings: string;
  ingredients: Ingredient[];
  instructions?: string[];
  story: string;
  culturalContext: string;
  subtitles?: Subtitle[];
};

export default function RecipeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addItem, addMultipleItems } = useShoppingList();

  const [activeTab, setActiveTab] = useState('recipe');
  const [savedIngredients, setSavedIngredients] = useState(new Set<number>());
  const [isSaved, setIsSaved] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [currentTranslation, setCurrentTranslation] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{[recipeId: string]: {question: string, answer: string}[]}>({});
  const [chatQuestion, setChatQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // Define recipe FIRST
  const recipe: Recipe = params.recipeData 
    ? JSON.parse(params.recipeData as string)
    : {
        title: "Abuela's Empanadas",
        videoUrl: null,
        imageUrl: "https://images.unsplash.com/photo-1625938145312-880f3b3a5d3d?w=800",
        elderName: "Rosa Martinez",
        preservedBy: "Maria Rodriguez",
        prepTime: "45 min",
        servings: "6",
        ingredients: [
          { id: 1, name: "2 cups all-purpose flour" },
          { id: 2, name: "1 lb ground beef" },
          { id: 3, name: "1 large onion, diced" },
          { id: 4, name: "2 tsp cumin" },
          { id: 5, name: "1 tsp paprika" },
          { id: 6, name: "Salt and pepper to taste" }
        ],
        instructions: [],
        story: "My grandmother learned this recipe from her mother in the Dominican Republic...",
        culturalContext: "Empanadas are a staple in Latin American cuisine...",
        subtitles: []
      };

  // NOW define recipeId after recipe exists
  const recipeId = params.id as string || recipe.title;
  
  // Get chat history for this specific recipe
  const currentRecipeChat = chatHistory[recipeId] || [];

      
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.isPlaying && recipe.subtitles && recipe.subtitles.length > 0) {
      const currentTime = status.positionMillis / 1000;
      
      const currentWords = recipe.subtitles.filter(
        (sub: Subtitle) => currentTime >= (sub.start - 0.1) && currentTime <= (sub.end + 0.3)
      );
      
      if (currentWords.length > 0) {
        const spanishPhrase = currentWords.map((w: Subtitle) => w.text).join(' ');
        setCurrentSubtitle(spanishPhrase);
        
        const englishPhrase = currentWords.map((w: Subtitle) => w.translation).join(' ');
        setCurrentTranslation(englishPhrase);
      } else {
        setCurrentSubtitle('');
        setCurrentTranslation('');
      }
    }
  };

  const askQuestion = async () => {
  if (!chatQuestion.trim()) return;
  
  setIsAsking(true);
  const answer = await askRecipeQuestion(
    chatQuestion,
    recipe.title,
    recipe.ingredients.map(i => i.name),
    recipe.instructions || [],
    recipe.story,
    recipe.culturalContext
  );
  
  // Store the Q&A for this specific recipe
  setChatHistory(prev => ({
    ...prev,
    [recipeId]: [
      ...(prev[recipeId] || []),
      { question: chatQuestion, answer }
    ]
  }));
  
  setChatQuestion(''); // Clear input
  setIsAsking(false);
};


  const toggleIngredient = (id: number) => {
    const ingredient = recipe.ingredients.find((i: Ingredient) => i.id === id);
    
    if (savedIngredients.has(id)) {
      setSavedIngredients(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } else {
      setSavedIngredients(prev => new Set(prev).add(id));
      if (ingredient) {
        addItem(ingredient.name, recipe.title);
      }
    }
  };

  const addAllToList = () => {
    setSavedIngredients(new Set(recipe.ingredients.map((i: Ingredient) => i.id)));
    
    const itemsToAdd = recipe.ingredients.map((ingredient: Ingredient) => ({
      name: ingredient.name,
      recipeTitle: recipe.title,
    }));
    
    addMultipleItems(itemsToAdd);
    
    Alert.alert('Success!', `Added ${recipe.ingredients.length} ingredients to shopping list`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recipe</Text>
        <TouchableOpacity onPress={() => setIsSaved(!isSaved)}>
          <Text style={styles.heartIcon}>{isSaved ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.mediaContainer}>
          {recipe.videoUrl ? (
            <>
              <Video
                source={{ uri: recipe.videoUrl }}
                style={styles.mediaImage}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
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
            </>
          ) : (
            <Image 
              source={{ uri: recipe.imageUrl }}
              style={styles.mediaImage}
            />
          )}
          <View style={styles.waveOverlay} />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.elderName}>From {recipe.elderName}</Text>
          <Text style={styles.preservedBy}>Preserved by @{recipe.preservedBy}</Text>
          
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>🕒 {recipe.prepTime}</Text>
            <Text style={styles.metaText}>🍽️ Serves {recipe.servings}</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Start Cooking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>🛒</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('recipe')}
            style={styles.tab}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'recipe' && styles.activeTabText
            ]}>
              Recipe
            </Text>
            {activeTab === 'recipe' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setActiveTab('story')}
            style={styles.tab}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'story' && styles.activeTabText
            ]}>
              Story
            </Text>
            {activeTab === 'story' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('ask')}
            style={styles.tab}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'ask' && styles.activeTabText
            ]}>
              Ask 💬
            </Text>
            {activeTab === 'ask' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {activeTab === 'recipe' ? (
            <View style={styles.ingredientsCard}>
              <Text style={styles.ingredientsTitle}>Ingredients</Text>
              
              {recipe.ingredients.map((ingredient: Ingredient) => (
                <View key={ingredient.id} style={styles.ingredientRow}>
                  <View style={styles.ingredientLeft}>
                    <View style={styles.checkbox}>
                      {savedIngredients.has(ingredient.id) && (
                        <View style={styles.checkboxFilled} />
                      )}
                    </View>
                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleIngredient(ingredient.id)}
                    style={[
                      styles.addButton,
                      savedIngredients.has(ingredient.id) && styles.addButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.addButtonText,
                      savedIngredients.has(ingredient.id) && styles.addButtonTextActive
                    ]}>+</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.ingredientActions}>
                <TouchableOpacity 
                  style={styles.addAllButton}
                  onPress={addAllToList}
                >
                  <Text style={styles.addAllButtonText}>Add All to List</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.viewFullButton}>
                  <Text style={styles.viewFullButtonText}>View Full Recipe</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : activeTab === 'story' ? (
            <View>
              <View style={styles.storyCard}>
                <Text style={styles.storyTitle}>📖 The Story</Text>
                <Text style={styles.storyText}>{recipe.story}</Text>
              </View>

              <View style={styles.culturalCard}>
                <Text style={styles.culturalTitle}>🌍 Cultural Context</Text>
                <Text style={styles.culturalText}>{recipe.culturalContext}</Text>
              </View>
            </View>
          ) : (
// Replace the Ask tab content with:
<KeyboardAvoidingView 
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={styles.askContainer}
>
  <Text style={styles.askTitle}>Ask About This Recipe</Text>
  <Text style={styles.askSubtitle}>
    Get help with substitutions, techniques, or cooking questions
  </Text>
  
  {/* Show chat history */}
  {currentRecipeChat.map((chat, index) => (
    <View key={index} style={styles.chatBubbleContainer}>
      <View style={styles.questionBubble}>
        <Text style={styles.questionText}>{chat.question}</Text>
      </View>
      <View style={styles.answerCard}>
        <Text style={styles.answerText}>{chat.answer}</Text>
      </View>
    </View>
  ))}
  
  <TextInput
    style={styles.questionInput}
    placeholder="e.g., Can I use butter instead of oil?"
    placeholderTextColor="#9CA3AF"
    value={chatQuestion}
    onChangeText={setChatQuestion}
    multiline
  />
  
  <TouchableOpacity 
    style={styles.askButton}
    onPress={askQuestion}
    disabled={isAsking}
  >
    {isAsking ? (
      <ActivityIndicator color="#FFFFFF" />
    ) : (
      <Text style={styles.askButtonText}>Ask</Text>
    )}
  </TouchableOpacity>
</KeyboardAvoidingView>          )}
        </View>
      </ScrollView>
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
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 28,
    color: '#4B5563',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  heartIcon: {
    fontSize: 24,
  },
  mediaContainer: {
    height: 400,
    backgroundColor: '#BAE6FD',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  waveOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#86A952',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  elderName: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  preservedBy: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#374151',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#059669',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#047857',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#059669',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  contentContainer: {
    padding: 16,
  },
  ingredientsCard: {
    backgroundColor: '#84CC16',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ingredientsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  ingredientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#1F2937',
    borderRadius: 4,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxFilled: {
    width: 12,
    height: 12,
    backgroundColor: '#059669',
    borderRadius: 2,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  addButton: {
    width: 36,
    height: 36,
    backgroundColor: 'white',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonActive: {
    backgroundColor: '#059669',
  },
  addButtonText: {
    fontSize: 20,
    color: '#374151',
  },
  addButtonTextActive: {
    color: 'white',
  },
  ingredientActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  addAllButton: {
    flex: 1,
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  addAllButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  viewFullButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  viewFullButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  storyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  storyText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  culturalCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  culturalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  culturalText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  subtitleOverlay: {
    position: 'absolute',
    bottom: 100,
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
  askContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  askTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  askSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  questionInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#059669',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  askButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  askButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  answerCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  chatBubbleContainer: {
  marginBottom: 16,
},
questionBubble: {
  backgroundColor: '#E0F2FE',
  borderRadius: 12,
  padding: 12,
  marginBottom: 8,
  alignSelf: 'flex-end',
  maxWidth: '80%',
},
questionText: {
  fontSize: 15,
  color: '#1F2937',
},
});