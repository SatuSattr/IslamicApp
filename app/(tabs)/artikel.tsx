import { useScrollDirection } from '@/contexts/scroll-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    ScrollView as RNScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Types ---
type Article = {
    title: string;
    pubDate: string;
    link: string;
    guid: string;
    author: string;
    thumbnail: string;
    description: string;
    content: string;
    enclosure: {
        link?: string;
    };
    categories: string[];
};

const CATEGORIES = [
    'Semua', 'Islam', 'Ramadhan', 'Ibadah', 'Kisah Nabi', 'Tafsir', 'Fiqih'
];

const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
};

const formatDate = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
};

function ArticleCard({ item }: { item: Article }) {
    const handleReadMore = () => {
        WebBrowser.openBrowserAsync(item.link);
    };

    const imageUrl = item.thumbnail || item.enclosure?.link;
    const cleanDescription = stripHtml(item.description || item.content).slice(0, 120) + '...';

    return (
        <View style={styles.articleCard}>
            {imageUrl && (
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.articleImage}
                    resizeMode="cover"
                />
            )}
            <View style={styles.articleContent}>
                <View style={styles.articleMeta}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>
                            {item.categories?.[0] || 'Islam'}
                        </Text>
                    </View>
                    <Text style={styles.dateText}>{formatDate(item.pubDate)}</Text>
                </View>

                <Text style={styles.articleTitle} numberOfLines={2}>
                    {item.title}
                </Text>

                <Text style={styles.articleSnippet} numberOfLines={3}>
                    {cleanDescription}
                </Text>

                <View style={styles.articleFooter}>
                    <Text style={styles.authorText} numberOfLines={1}>
                        {item.author || 'Republika'}
                    </Text>
                    <Pressable onPress={handleReadMore} style={styles.readMoreBtn}>
                        <Text style={styles.readMoreLink}>Baca Selengkapnya</Text>
                        <MaterialIcons name="open-in-new" size={14} color="#6F8F72" />
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

export default function ArtikelScreen() {
    const insets = useSafeAreaInsets();
    const { handleScroll } = useScrollDirection();

    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    useEffect(() => {
        async function fetchArticles() {
            try {
                const response = await fetch(
                    'https://api.rss2json.com/v1/api.json?rss_url=https://republika.co.id/rss/khazanah'
                );
                const data = await response.json();
                if (data.status === 'ok') {
                    setArticles(data.items);
                }
            } catch (error) {
                console.error('Error fetching articles:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchArticles();
    }, []);

    const filteredArticles = useMemo(() => {
        if (selectedCategory === 'Semua') return articles;
        return articles.filter(article =>
            article.categories.some(cat =>
                cat.toLowerCase().includes(selectedCategory.toLowerCase())
            )
        );
    }, [articles, selectedCategory]);

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTitleRow}>
                <MaterialIcons name="article" size={28} color="#1a1a1a" />
                <Text style={styles.headerTitle}>Artikel</Text>
            </View>
            <Text style={styles.headerSubtitle}>Berita dan artikel Islami terkini</Text>

            <RNScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterBar}
                contentContainerStyle={styles.filterBarContent}
            >
                {CATEGORIES.map((cat) => (
                    <Pressable
                        key={cat}
                        onPress={() => setSelectedCategory(cat)}
                        style={[
                            styles.filterChip,
                            selectedCategory === cat && styles.filterChipActive
                        ]}
                    >
                        <Text style={[
                            styles.filterLabel,
                            selectedCategory === cat && styles.filterLabelActive
                        ]}>
                            {cat}
                        </Text>
                    </Pressable>
                ))}
            </RNScrollView>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#6F8F72" />
                </View>
            ) : (
                <FlatList
                    ListHeaderComponent={renderHeader}
                    data={filteredArticles}
                    keyExtractor={(item) => item.guid || item.link}
                    renderItem={({ item }) => <ArticleCard item={item} />}
                    contentContainerStyle={{
                        paddingBottom: 120,
                        paddingTop: insets.top + 16
                    }}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1a1a1a',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    filterBar: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    filterBarContent: {
        gap: 12,
        paddingRight: 40,
        paddingBottom: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
    },
    filterChipActive: {
        backgroundColor: '#6F8F72',
        borderColor: '#6F8F72',
    },
    filterLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
    },
    filterLabelActive: {
        color: '#fff',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    articleCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        elevation: 2,
    },
    articleImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#f0f0f0',
    },
    articleContent: {
        padding: 16,
    },
    articleMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    categoryBadge: {
        backgroundColor: '#F0F4F1',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 11,
        color: '#6F8F72',
        fontWeight: '700',
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    articleTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1a1a1a',
        lineHeight: 24,
        marginBottom: 8,
    },
    articleSnippet: {
        fontSize: 13,
        color: '#666',
        lineHeight: 20,
        marginBottom: 16,
    },
    articleFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5',
    },
    authorText: {
        fontSize: 12,
        color: '#999',
        flex: 1,
        marginRight: 10,
    },
    readMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readMoreLink: {
        fontSize: 12,
        color: '#6F8F72',
        fontWeight: '700',
    },
});
