import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

export default function HomeScreen() {
  const router = useRouter();
  
  // Sample recipe data - each with full details
  const recipes = [
    {
      id: '1',
      title: "Abuela's Empanadas",
      elderName: "Rosa Martinez",
      preservedBy: "Maria Rodriguez",
      imageUrl: "https://images.unsplash.com/photo-1625938145312-880f3b3a5d3d?w=800",
      date: "Jun 10, 2024",
      imageHeight: 280,
      prepTime: "45 min",
      servings: "6",
      videoUrl: null,
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
    },
    {
      id: '2',
      title: "Nonna's Pasta Carbonara",
      elderName: "Maria Rossi",
      preservedBy: "Giovanni Rossi",
      imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800",
      date: "Jun 9, 2024",
      imageHeight: 200,
      prepTime: "30 min",
      servings: "4",
      videoUrl: null,
      ingredients: [
        { id: 1, name: "400g spaghetti" },
        { id: 2, name: "200g guanciale" },
        { id: 3, name: "4 egg yolks" },
        { id: 4, name: "100g Pecorino Romano" },
        { id: 5, name: "Black pepper" }
      ],
      story: "My Nonna made this every Sunday in Rome. She would always say 'no cream!' and taught me the secret of tempering the eggs with pasta water to create that silky sauce.",
      culturalContext: "Carbonara is one of Rome's four classic pasta dishes. The authentic version uses guanciale (cured pork jowl), never bacon, and absolutely no cream."
    },
    {
      id: '3',
      title: "Grandma's Apple Pie",
      elderName: "Betty Johnson",
      preservedBy: "Sarah Johnson",
      imageUrl: "https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=800",
      date: "Jun 8, 2024",
      imageHeight: 240,
      prepTime: "2 hours",
      servings: "8",
      videoUrl: null,
      ingredients: [
        { id: 1, name: "6 Granny Smith apples" },
        { id: 2, name: "2 cups all-purpose flour" },
        { id: 3, name: "1 cup butter, cold" },
        { id: 4, name: "3/4 cup sugar" },
        { id: 5, name: "2 tsp cinnamon" },
        { id: 6, name: "1/4 tsp nutmeg" }
      ],
      story: "Grandma Betty won the county fair with this pie three years in a row. Her secret? A tablespoon of apple cider vinegar in the crust for extra flakiness.",
      culturalContext: "Apple pie has been an American tradition since the colonial era. The phrase 'as American as apple pie' reflects its status as a symbol of American culture and comfort."
    },
    {
      id: '4',
      title: "Bánh Mì from Bà Nội",
      elderName: "Linh Nguyen",
      preservedBy: "Minh Nguyen",
      imageUrl: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=800",
      date: "Jun 10, 2024",
      imageHeight: 260,
      prepTime: "1 hour",
      servings: "4",
      videoUrl: null,
      ingredients: [
        { id: 1, name: "4 Vietnamese baguettes" },
        { id: 2, name: "500g pork shoulder" },
        { id: 3, name: "Pickled daikon and carrot" },
        { id: 4, name: "Fresh cilantro" },
        { id: 5, name: "Cucumber slices" },
        { id: 6, name: "Pâté and mayo" }
      ],
      story: "Bà Nội sold bánh mì from a street cart in Saigon for 40 years. She taught me how to balance the five essential flavors: spicy, sour, sweet, salty, and umami.",
      culturalContext: "Bánh mì represents the fusion of Vietnamese and French colonial influences, combining French baguettes with traditional Vietnamese ingredients and flavors."
    },
    {
      id: '5',
      title: "Yiayia's Moussaka",
      elderName: "Sophia Papadopoulos",
      preservedBy: "Dimitri Papadopoulos",
      imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800",
      date: "Jun 7, 2024",
      imageHeight: 220,
      prepTime: "90 min",
      servings: "8",
      videoUrl: null,
      ingredients: [
        { id: 1, name: "3 large eggplants" },
        { id: 2, name: "1 lb ground lamb" },
        { id: 3, name: "Béchamel sauce" },
        { id: 4, name: "Tomato sauce" },
        { id: 5, name: "Cinnamon and nutmeg" },
        { id: 6, name: "Kefalotiri cheese" }
      ],
      story: "Yiayia came from Crete and made moussaka for every family celebration. The secret is adding a touch of cinnamon to the meat sauce - it makes all the difference.",
      culturalContext: "Moussaka is Greece's national dish, with variations found throughout the Balkans and Middle East. The Greek version with béchamel topping was popularized in the 1920s."
    },
    {
      id: '6',
      title: "Bubbie's Challah Bread",
      elderName: "Ruth Goldstein",
      preservedBy: "Rachel Goldstein",
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
      date: "Jun 6, 2024",
      imageHeight: 200,
      prepTime: "3 hours",
      servings: "12",
      videoUrl: null,
      ingredients: [
        { id: 1, name: "4 cups bread flour" },
        { id: 2, name: "2 eggs" },
        { id: 3, name: "1/3 cup honey" },
        { id: 4, name: "1/4 cup oil" },
        { id: 5, name: "1 tbsp yeast" },
        { id: 6, name: "Egg wash and sesame seeds" }
      ],
      story: "Bubbie braided challah every Friday for Shabbat. She taught me the six-strand braid and always saved the end piece for me to snack on fresh from the oven.",
      culturalContext: "Challah is a ceremonial Jewish bread eaten on Sabbath and holidays. The braiding symbolizes unity, and the tradition dates back thousands of years."
    },
  ];

  const leftColumn = recipes.filter((_, index) => index % 2 === 0);
  const rightColumn = recipes.filter((_, index) => index % 2 === 1);

  const RecipeCard = ({ recipe }: { recipe: typeof recipes[0] }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9}
      onPress={() => router.push({
        pathname: '/(tabs)/recipe' as any,
        params: { 
          id: recipe.id,
          recipeData: JSON.stringify(recipe) // Pass full recipe data
        }
      })}
    >
      <Image
        source={{ uri: recipe.imageUrl }}
        style={[styles.cardImage, { height: recipe.imageHeight }]}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.cardElder}>From {recipe.elderName}</Text>
        <Text style={styles.cardDate}>{recipe.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recipes Blog</Text>
        <Text style={styles.headerSubtitle}>
          Discover and browse delicious recipes visually.
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchIconContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes, ingredients, cultures..."
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Masonry Grid */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {/* Left Column */}
          <View style={styles.column}>
            {leftColumn.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            {rightColumn.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.push('/(tabs)/upload' as any)}
        >
          <Text style={styles.navIcon}>➕</Text>
          <Text style={styles.navText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>❤️</Text>
          <Text style={styles.navText}>Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.push('/(tabs)/profile' as any)}

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
    backgroundColor: '#F9FAFB', // Matches recipe detail page
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937', // Matches recipe detail
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280', // Matches recipe detail
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Changed to white
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  column: {
    flex: 1,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    backgroundColor: '#E5E7EB',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937', // Matches recipe detail
    marginBottom: 4,
  },
  cardElder: {
    fontSize: 13,
    color: '#4B5563', // Matches recipe detail
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 12,
    color: '#6B7280', // Matches recipe detail
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
    color: '#059669', // Green accent matches recipe page
    fontWeight: '600',
  },
  searchIconContainer: {
  width: 32,
  height: 32,
  backgroundColor: '#059669',
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
},
});