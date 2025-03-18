import axios from 'axios';

// NOTE: This API key is the free tier from NewsAPI.org, so it's not a secret.
const API_KEY = 'cd00e60d5e354c99a1d67fb99609d403';
const BASE_URL = 'https://newsapi.org/v2';

export const fetchNews = async ({
  category = 'all',
  searchTerm = '',
  searchIn = 'title,description,content',
  sortBy = 'publishedAt',
  language = 'en',
  page = 1,
  pageSize = 10,
}: {
  category?: string;
  searchTerm?: string;
  searchIn?: string;
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
  language?: string;
  page?: number;
  pageSize?: number;
}) => {
  try {
    const params: Record<string, string | number> = {
      apiKey: API_KEY,
      searchIn,
      sortBy,
      language,
      pageSize,
      page,
    };

    if (searchTerm) {
      params.q = searchTerm;
    }

    if (category !== 'all') {
      const categorySources: Record<string, string> = {
        politics: 'bbc-news,the-guardian-uk',
        technology: 'techcrunch,wired',
        sports: 'espn,bbc-sport',
        business: 'bloomberg,financial-times',
      };

      params.sources = categorySources[category] || '';
    } else if (!searchTerm) {
      params.q = 'news';
    }

    const response = await axios.get(`${BASE_URL}/everything`, { params });

    if (response.data.status !== 'ok') {
      throw new Error(response.data.message || 'Invalid API response');
    }

    return {
      articles: response.data.articles,
      nextPage: page + 1,
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    throw new Error('Failed to fetch news');
  }
};
