import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShoppingList } from '../context/ShoppingContext';
import { getUserRecipes, RecipeData } from '../services/recipeService';

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('shopping');
  const { items, toggleItem, clearCompleted } = useShoppingList();
  const [myRecipes, setMyRecipes] = useState<RecipeData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'myrecipes') {
      loadMyRecipes();
    }
  }, [activeTab]);

  const loadMyRecipes = async () => {
    setLoading(true);
    try {
      const recipes = await getUserRecipes('tempUserId');
      setMyRecipes(recipes);
      console.log('Loaded recipes:', recipes.length);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const savedRecipes = [
    {
      id: '1',
      title: "Abuela's Empanadas",
      elderName: "Rosa Martinez",
      imageUrl: "https://images.unsplash.com/photo-1625938145312-880f3b3a5d3d?w=400",
    },
    {
      id: '3',
      title: "Grandma's Apple Pie",
      elderName: "Betty Johnson",
      imageUrl: "https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400",
    },
  ];

  const user = {
    name: "Sarah Martinez",
    username: "@sarah_m",
    recipesPreserved: 3,
    recipesSaved: 2,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with decorative wave */}
      <View style={styles.headerContainer}>
        <View style={styles.waveBackground}>
          <View style={styles.wave1} />
          <View style={styles.wave2} />
        </View>
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>SM</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userHandle}>{user.username}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{user.recipesPreserved}</Text>
              <Text style={styles.statLabel}>Preserved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{user.recipesSaved}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('shopping')}
          style={[styles.tab, activeTab === 'shopping' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'shopping' && styles.tabTextActive]}>
            Shopping
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('saved')}
          style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
            Saved
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('myrecipes')}
          style={[styles.tab, activeTab === 'myrecipes' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'myrecipes' && styles.tabTextActive]}>
            My Recipes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'shopping' ? (
          <View style={styles.shoppingList}>
            {items.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🛒</Text>
                <Text style={styles.emptyStateText}>Your shopping list is empty</Text>
                <Text style={styles.emptyStateSubtext}>
                  Add ingredients from recipes to get started!
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>Shopping List</Text>
                  {items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.shoppingItem}
                      onPress={() => toggleItem(item.id)}
                    >
                      <View style={styles.checkbox}>
                        {item.checked && (
                          <View style={styles.checkboxFilled} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.itemText,
                            item.checked && styles.itemTextChecked
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text style={styles.itemRecipe}>
                          from {item.recipeTitle}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {items.some(item => item.checked) && (
                  <TouchableOpacity style={styles.clearButton} onPress={clearCompleted}>
                    <Text style={styles.clearButtonText}>
                      Clear Completed ({items.filter(item => item.checked).length})
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        ) : activeTab === 'saved' ? (
          <View style={styles.savedRecipesGrid}>
            {savedRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.savedRecipeCard}
                onPress={() => router.push({
                  pathname: '/(tabs)/recipe' as any,
                  params: { id: recipe.id }
                })}
              >
                <Image
                  source={{ uri: recipe.imageUrl }}
                  style={styles.savedRecipeImage}
                />
                <View style={styles.savedRecipeContent}>
                  <Text style={styles.savedRecipeTitle} numberOfLines={2}>
                    {recipe.title}
                  </Text>
                  <Text style={styles.savedRecipeElder}>
                    From {recipe.elderName}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.myRecipesGrid}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#059669" />
                <Text style={styles.loadingText}>Loading your recipes...</Text>
              </View>
            ) : myRecipes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🎥</Text>
                <Text style={styles.emptyStateText}>No recipes uploaded yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Upload your first recipe video to preserve family traditions!
                </Text>
              </View>
            ) : (
              myRecipes.map((recipe) => {
                const imageUrl = recipe.thumbnailUrl && recipe.thumbnailUrl.trim() !== '' 
                  ? recipe.thumbnailUrl 
                  : 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400';
                
                return (
                  <TouchableOpacity
                    key={recipe.id}
                    style={styles.myRecipeCard}
                    onPress={() => {
                      console.log('Recipe video URL:', recipe.videoUrl);
                      console.log('Recipe has subtitles:', recipe.subtitles?.length || 0);
                      
                      router.push({
                        pathname: '/(tabs)/recipe' as any,
                        params: { 
                          id: recipe.id,
                          recipeData: JSON.stringify({
                            title: recipe.title,
                            elderName: recipe.elderName,
                            preservedBy: recipe.preservedBy,
                            videoUrl: recipe.videoUrl || null,
                            imageUrl: imageUrl,
                            prepTime: recipe.prepTime,
                            servings: '4',
                            ingredients: recipe.ingredients.map((ing, idx) => ({ id: idx + 1, name: ing })),
                            story: recipe.story,
                            culturalContext: recipe.culturalContext,
                            subtitles: recipe.subtitles || [],
                          })
                        }
                      });
                    }}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.myRecipeImage}
                    />
                    {recipe.videoUrl && (
                      <View style={styles.playIconOverlay}>
                        <Text style={styles.playIcon}>▶️</Text>
                      </View>
                    )}
                    <View style={styles.myRecipeContent}>
                      <View style={styles.myRecipeHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.myRecipeTitle} numberOfLines={2}>
                            {recipe.title}
                          </Text>
                          <Text style={styles.myRecipeElder}>
                            From {recipe.elderName}
                          </Text>
                        </View>
                        <View style={[
                          styles.visibilityBadge,
                          recipe.isPublic ? styles.publicBadge : styles.privateBadge
                        ]}>
                          <Text style={styles.visibilityText}>
                            {recipe.isPublic ? '🌍 Public' : '🔒 Private'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.uploadDate}>
                        Uploaded {new Date(recipe.uploadedAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
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
          <Text style={styles.navText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>❤️</Text>
          <Text style={styles.navText}>Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navTextActive}>Profile</Text>
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
  headerContainer: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
  },
  waveBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: '#BAE6FD',
  },
  wave1: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#A3D977',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    transform: [{ scaleX: 2 }],
  },
  wave2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#86A952',
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    transform: [{ scaleX: 2 }],
  },
  profileSection: {
    paddingTop: 40,
    alignItems: 'center',
    zIndex: 1,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
  },
  userHandle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#86A952',
  },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#84CC16',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  shoppingList: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 12,
    paddingLeft: 8,
  },
  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#059669',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxFilled: {
    width: 14,
    height: 14,
    backgroundColor: '#059669',
    borderRadius: 3,
  },
  itemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  itemTextChecked: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  itemRecipe: {
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
  },
  clearButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  savedRecipesGrid: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  savedRecipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  savedRecipeImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  savedRecipeContent: {
    padding: 12,
    borderTopWidth: 2,
    borderTopColor: '#84CC16',
  },
  savedRecipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  savedRecipeElder: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: '#059669',
    paddingVertical: 8,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
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
  myRecipesGrid: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  myRecipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  myRecipeImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  playIconOverlay: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
  },
  myRecipeContent: {
    padding: 12,
    borderTopWidth: 2,
    borderTopColor: '#059669',
  },
  myRecipeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  myRecipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  myRecipeElder: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  visibilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  publicBadge: {
    backgroundColor: '#D1FAE5',
  },
  privateBadge: {
    backgroundColor: '#FEE2E2',
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  uploadDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});