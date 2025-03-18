import { useState, useEffect } from "react";
import { Search, Newspaper, ChevronRight, ArrowRight, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchNews } from "./lib/apiUtils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

export default function NewsApp() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { ref, inView } = useInView();

  const categories = ["all", "politics", "technology", "sports", "business", "entertainment", "health"];

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["news", activeCategory, searchTerm],
    queryFn: ({ pageParam = 1 }) =>
      fetchNews({
        category: activeCategory,
        searchTerm,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const allNews = data?.pages.flatMap((page) => page.articles) || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b shadow-sm">
        <div className="container mx-auto py-4 px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                NewsHub
              </h1>
            </div>
            
            <form onSubmit={handleSearch} className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for news..."
                className="pl-10 pr-20 py-6 rounded-full border-slate-200 dark:border-slate-800 focus-visible:ring-primary"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-4"
              >
                Search
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "rounded-full capitalize whitespace-nowrap transition-all",
                activeCategory === category 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-primary/10 dark:hover:bg-primary/20"
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        {status === "pending" ? (
          <NewsSkeletons />
        ) : status === "error" ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center p-6 max-w-md mx-auto">
              <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg mb-4">
                <p className="text-red-600 dark:text-red-400 font-medium">Error loading news</p>
                <p className="text-sm text-red-500/80 dark:text-red-400/80 mt-1">{error.message}</p>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try again
              </Button>
            </div>
          </div>
        ) : (
          <main>
            {/* Featured Section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Featured Stories</h2>
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  View all <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {allNews.length > 0 ? (
                  <>
                    <Card className="overflow-hidden col-span-1 lg:col-span-2 group hover:shadow-md transition-all duration-300">
                      <div className="aspect-[16/9] relative">
                        <img
                          src={allNews[0]?.urlToImage || "/placeholder.svg?height=600&width=1200"}
                          alt={allNews[0]?.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                          <Badge className="mb-3 bg-primary hover:bg-primary/90">Breaking News</Badge>
                          <h3 className="text-2xl font-bold mb-2 line-clamp-2">{allNews[0]?.title}</h3>
                          <p className="text-white/80 line-clamp-2 mb-3">{allNews[0]?.description}</p>
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Clock className="h-3 w-3" />
                            <time dateTime={allNews[0]?.publishedAt}>
                              {new Date(allNews[0]?.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </time>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <div className="flex flex-col gap-6">
                      {allNews.slice(1, 3).map((news) => (
                        <Card key={news.url} className="overflow-hidden group hover:shadow-md transition-all duration-300">
                          <div className="aspect-[16/10] relative">
                            <img
                              src={news.urlToImage || "/placeholder.svg?height=300&width=500"}
                              alt={news.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-4 text-white">
                              <Badge variant="secondary" className="mb-2 bg-white/20 hover:bg-white/30 text-white">
                                Featured
                              </Badge>
                              <h3 className="font-bold line-clamp-2">{news.title}</h3>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="col-span-3 text-center text-muted-foreground py-12">No featured stories available</p>
                )}
              </div>
            </section>

            {/* Latest News Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Latest News</h2>
                {searchTerm && (
                  <Badge variant="outline" className="px-3 py-1">
                    Search results for: {searchTerm}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allNews.slice(3).map((news) => (
                  <Card 
                    key={news.url} 
                    className="overflow-hidden flex flex-col h-full hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={news.urlToImage || "/placeholder.svg?height=300&width=500"}
                        alt={news.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";
                        }}
                      />
                      {news.source?.name && (
                        <Badge className="absolute top-3 left-3 bg-black/70 hover:bg-black/80">
                          {news.source.name}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2 flex-grow">
                        {news.description || "No description available"}
                      </p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground mt-auto pt-3 border-t">
                        <span className="line-clamp-1">{news.author || "Unknown"}</span>
                        <time dateTime={news.publishedAt} className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(news.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </time>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More / End of Results */}
              <div 
                ref={ref} 
                className="py-10 text-center"
              >
                {isFetchingNextPage ? (
                  <div className="flex justify-center items-center gap-2">
                    <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span className="text-muted-foreground">Loading more stories...</span>
                  </div>
                ) : hasNextPage ? (
                  <Button variant="outline" onClick={() => fetchNextPage()} className="gap-2">
                    Load more <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : allNews.length > 0 ? (
                  <p className="text-muted-foreground">You've reached the end of the news feed</p>
                ) : (
                  <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-8 max-w-md mx-auto">
                    <p className="text-muted-foreground">No news articles found matching your criteria</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchInput("");
                        setSearchTerm("");
                        setActiveCategory("all");
                      }}
                    >
                      Reset filters
                    </Button>
                  </div>
                )}
              </div>
            </section>
          </main>
        )}
      </div>
      
      <footer className="bg-slate-100 dark:bg-slate-900 border-t py-6 mt-12">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} NewsHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function NewsSkeletons() {
  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2">
            <Skeleton className="aspect-[16/9] w-full rounded-lg" />
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="aspect-[16/10] w-full rounded-lg" />
            <Skeleton className="aspect-[16/10] w-full rounded-lg" />
          </div>
        </div>
      </section>
      
      <section>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between mt-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
