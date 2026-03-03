import { useScrollDirection } from "@/contexts/scroll-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- Types ---
type HadithBook = {
  name: string;
  id: string;
  available: number;
};

type Hadith = {
  number: number;
  arab: string;
  id: string; // Indonesian translation
};

type HadithResponse = {
  data: {
    name: string;
    id: string;
    available: number;
    hadiths: Hadith[];
  };
};

function HadithCard({
  item,
  bookName,
  bookId,
  router,
}: {
  item: Hadith;
  bookName: string;
  bookId: string;
  router: any;
}) {
  // Extract a "title" from the Indonesian text - usually the first sentence or first few words
  const title = useMemo(() => {
    const firstPeriod = item.id.indexOf(".");
    const snippet =
      firstPeriod !== -1 && firstPeriod < 60
        ? item.id.substring(0, firstPeriod).trim()
        : item.id.substring(0, 50).trim() + "...";
    return (
      snippet
        .replace(/^Dari\s+[A-Za-z]+\s+(.*?)\s+berkata:?\s*/i, "$1")
        .trim() || `Hadits ${item.number}`
    );
  }, [item.id, item.number]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.numberBadge}>
          <Text style={styles.numberBadgeText}>#{item.number}</Text>
        </View>
      </View>

      <Text style={styles.arabicText} numberOfLines={3}>
        {item.arab}
      </Text>

      <Text style={styles.translationText} numberOfLines={2}>
        {item.id}
      </Text>

      <View style={styles.cardFooter}>
        <Pressable
          style={styles.detailButton}
          onPress={() =>
            router.push({
              pathname: "/hadith-detail",
              params: { book: bookId, number: item.number },
            })
          }
        >
          <Text style={styles.detailButtonText}>Detail</Text>
          <MaterialIcons name="chevron-right" size={18} color="#6F8F72" />
        </Pressable>
        <Pressable style={styles.saveButton}>
          <MaterialIcons name="bookmark-border" size={18} color="#6F8F72" />
          <Text style={styles.saveButtonText}>Simpan</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function HadithScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { handleScroll } = useScrollDirection();

  const [books, setBooks] = useState<HadithBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>("bukhari");
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [range, setRange] = useState({ start: 1, end: 20 });

  // Fetch list of books
  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch("https://api.hadith.gading.dev/books");
        const json = await res.json();
        if (json.code === 200) {
          setBooks(json.data);
        }
      } catch (err) {
        console.error("Error fetching books:", err);
      }
    }
    fetchBooks();
  }, []);

  // Fetch hadiths when book or range changes
  useEffect(() => {
    async function fetchHadiths() {
      setLoading(true);
      try {
        const url = `https://api.hadith.gading.dev/books/${selectedBook}?range=${range.start}-${range.end}`;
        const res = await fetch(url);
        const json: HadithResponse = await res.json();
        setHadiths(json.data.hadiths);
      } catch (err) {
        console.error("Error fetching hadiths:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHadiths();
  }, [selectedBook, range]);

  // --- Smart Search Logic ---
  useEffect(() => {
    if (!searchQuery) return;

    const timer = setTimeout(() => {
      const query = searchQuery.toLowerCase().trim();
      const parts = query.split(/\s+/);

      let foundBookId: string | null = null;
      let foundNumber: number | null = null;
      let keywords = "";

      // 1. Identify Book
      for (const part of parts) {
        const bookMatch = books.find(
          (b) => b.id.includes(part) || b.name.toLowerCase().includes(part)
        );
        if (bookMatch) {
          foundBookId = bookMatch.id;
          break;
        }
      }

      // 2. Identify Number
      for (const part of parts) {
        const num = parseInt(part);
        if (!isNaN(num) && num > 0) {
          foundNumber = num;
          break;
        }
      }

      // Update state based on detection
      if (foundBookId && foundBookId !== selectedBook) {
        setSelectedBook(foundBookId);
        if (foundNumber) {
          setRange({ start: foundNumber, end: foundNumber + 19 });
        } else {
          setRange({ start: 1, end: 20 });
        }
      } else if (foundNumber) {
        // If only number changes or same book but new number
        // Check if number is outside current range
        if (foundNumber < range.start || foundNumber > range.end) {
          setRange({ start: foundNumber, end: foundNumber + 19 });
        }
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery, books]);

  const filteredHadiths = useMemo(() => {
    if (!searchQuery) return hadiths;

    const query = searchQuery.toLowerCase();
    // Extract plain keywords (not the book name or potential number)
    const parts = query.split(/\s+/);
    const keywords = parts
      .filter((p) => {
        const isBook = books.some(
          (b) => b.id.includes(p) || b.name.toLowerCase().includes(p)
        );
        const isNum = !isNaN(parseInt(p));
        return !isBook && !isNum;
      })
      .join(" ");

    return hadiths.filter((h) => {
      const matchesNumber =
        h.number.toString().includes(query) ||
        parts.includes(h.number.toString());
      const matchesText = !keywords || h.id.toLowerCase().includes(keywords);
      return matchesNumber || matchesText;
    });
  }, [hadiths, searchQuery, books]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="library-books" size={28} color="#1a1a1a" />
            <Text style={styles.headerTitle}>Hadits</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={styles.headerBtn}>
              <MaterialIcons name="bookmark-border" size={26} color="#666" />
            </Pressable>
            <Pressable style={styles.headerBtn}>
              <MaterialIcons name="settings" size={26} color="#666" />
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={24} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari perawi, nomor, atau kata kunci..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      {/* Book Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {books.map((book) => (
            <Pressable
              key={book.id}
              style={[
                styles.filterChip,
                selectedBook === book.id && styles.filterChipActive,
              ]}
              onPress={() => {
                setSelectedBook(book.id);
                setRange({ start: 1, end: 20 }); // Reset range on book change
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedBook === book.id && styles.filterChipTextActive,
                ]}
              >
                {book.name.replace("HR. ", "").concat(" ")}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6F8F72" />
        </View>
      ) : (
        <FlatList
          data={filteredHadiths}
          keyExtractor={(item) => item.number.toString()}
          renderItem={({ item }) => (
            <HadithCard
              item={item}
              bookName={books.find((b) => b.id === selectedBook)?.name || ""}
              bookId={selectedBook}
              router={router}
            />
          )}
          contentContainerStyle={styles.listContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Tidak ada hadits ditemukan</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa", // Standardized with other pages
  },
  header: {
    paddingHorizontal: 20,
    backgroundColor: "#fafafa",
    paddingBottom: 16,
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
  },
  headerRight: {
    flexDirection: "row",
    gap: 16,
  },
  headerBtn: {
    padding: 2,
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: "#eee",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#1a1a1a",
  },
  filterContainer: {
    paddingBottom: 10,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E8E0D5",
  },
  filterChipActive: {
    backgroundColor: "#6F8F72",
    borderColor: "#6F8F72",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  filterChipTextActive: {
    color: "#FFF",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Space for floating tab bar
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E0D5",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  numberBadge: {
    backgroundColor: "#F0F4F1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  numberBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6F8F72",
  },
  arabicText: {
    fontSize: 22,
    color: "#333",
    lineHeight: 40,
    textAlign: "right",
    fontFamily: "NotoNaskhArabic",
    marginBottom: 15,
  },
  translationText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F5F0E9",
    paddingTop: 15,
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6F8F72",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4F1",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6F8F72",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
