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
} from 'react-native';

const { width } = Dimensions.get('window');

export default function RecipeDetailScreen() {
  const [activeTab, setActiveTab] = useState('recipe');
  const [savedIngredients, setSavedIngredients] = useState(new Set());
  const [isSaved, setIsSaved] = useState(false);

  // Sample data - replace with real data later
  const recipe = {
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
    story: "My grandmother learned this recipe from her mother in the Dominican Republic. Every Sunday, the whole family would gather in her kitchen to make empanadas together. The smell of cumin and beef would fill the entire house...",
    culturalContext: "Empanadas are a staple in Latin American cuisine, with each region having its own unique variation. Dominican empanadas are known for their flaky crust and savory meat filling."
  };

  const toggleIngredient = (id) => {
    setSavedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const addAllToList = () => {
    setSavedIngredients(new Set(recipe.ingredients.map(i => i.id)));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recipe</Text>
        <TouchableOpacity onPress={() => setIsSaved(!isSaved)}>
          <Text style={styles.heartIcon}>{isSaved ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Video/Image Section */}
        <View style={styles.mediaContainer}>
          <Image 
            source={{ uri: recipe.imageUrl }}
            style={styles.mediaImage}
          />
          {recipe.videoUrl && (
            <View style={styles.playButtonContainer}>
              <View style={styles.playButton}>
                <Text style={styles.playButtonText}>▶</Text>
              </View>
            </View>
          )}
          {/* Decorative Wave */}
          <View style={styles.waveOverlay} />
        </View>

        {/* Recipe Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.elderName}>From {recipe.elderName}</Text>
          <Text style={styles.preservedBy}>Preserved by @{recipe.preservedBy}</Text>
          
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>🕒 {recipe.prepTime}</Text>
            <Text style={styles.metaText}>🍽️ Serves {recipe.servings}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Start Cooking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>🛒</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
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
        </View>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          {activeTab === 'recipe' ? (
            <View style={styles.ingredientsCard}>
              <Text style={styles.ingredientsTitle}>Ingredients</Text>
              
              {recipe.ingredients.map((ingredient) => (
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
          ) : (
            <View>
              {/* The Story */}
              <View style={styles.storyCard}>
                <Text style={styles.storyTitle}>📖 The Story</Text>
                <Text style={styles.storyText}>{recipe.story}</Text>
              </View>

              {/* Cultural Context */}
              <View style={styles.culturalCard}>
                <Text style={styles.culturalTitle}>🌍 Cultural Context</Text>
                <Text style={styles.culturalText}>{recipe.culturalContext}</Text>
              </View>
            </View>
          )}
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
    height: 280,
    backgroundColor: '#BAE6FD',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: 'white',
    fontSize: 30,
    marginLeft: 5,
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
});