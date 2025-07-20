import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { MarkdownViewer } from "../components/MarkdownViewer";
import { PlusIcon } from "@heroicons/react/24/outline";
import { truncateText } from "../lib/utils";

// Types based on your backend models
type Tag = {
  _id: string;
  title: string;
};

type Content = {
  _id: string;
  link: string;
  type: "image" | "video" | "article" | "audio";
  title: string;
  notes?: string; // Optional notes field
  tags: Tag[];
  userId: string;
};

export function DashboardPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Fetch content
  const { data: content = [], isLoading: isLoadingContent } = useQuery({
    queryKey: ["content"],
    queryFn: async () => {
      const response = await api.get<Content[]>("/content");
      return response.data;
    },
  });

  // Fetch tags
  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await api.get<Tag[]>("/tag");
      return response.data;
    },
  });

  // Filter content based on search and tag
  const filteredContent = content.filter((item) => {
    const matchesSearch = searchQuery
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesTag = selectedTag
      ? item.tags.some((tag) => tag._id === selectedTag)
      : true;

    return matchesSearch && matchesTag;
  });

  // Get content type icon
  const getContentTypeIcon = (type: Content["type"]) => {
    switch (type) {
      case "image":
        return "🖼️";
      case "video":
        return "🎬";
      case "article":
        return "📄";
      case "audio":
        return "🎵";
      default:
        return "📌";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Your Brain</h1>
        <Link to="/content/new">
          <Button leftIcon={<PlusIcon className="h-5 w-5" />}>
            Add Content
          </Button>
        </Link>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search content..."
            className="w-full px-4 py-2 rounded-md border"
            style={{
              borderColor: "hsl(var(--input))",
              backgroundColor: "hsl(var(--background))",
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "primary" : "outline"}
            onClick={() => setViewMode("grid")}
            className="px-3"
          >
            Grid
          </Button>
          <Button
            variant={viewMode === "list" ? "primary" : "outline"}
            onClick={() => setViewMode("list")}
            className="px-3"
          >
            List
          </Button>
        </div>
      </div>

      {/* Tags filter */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedTag === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedTag(null)}
        >
          All
        </Badge>
        {tags.map((tag) => (
          <Badge
            key={tag._id}
            variant={selectedTag === tag._id ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedTag(tag._id)}
          >
            {tag.title}
          </Badge>
        ))}
      </div>

      {/* Content display */}
      {isLoadingContent ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <p style={{ color: "hsl(var(--muted-foreground))" }}>
            No content found
          </p>
          <Link to="/content/new" className="mt-4 inline-block">
            <Button>Add your first content</Button>
          </Link>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredContent.map((item) => (
            <Card
              key={item._id}
              className={viewMode === "list" ? "flex overflow-hidden" : ""}
            >
              {viewMode === "list" && (
                <div
                  className="flex items-center justify-center p-6 text-4xl"
                  style={{ backgroundColor: "hsl(var(--muted))" }}
                >
                  {getContentTypeIcon(item.type)}
                </div>
              )}
              <div className="flex-1">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {viewMode === "grid" && (
                      <span className="text-2xl">
                        {getContentTypeIcon(item.type)}
                      </span>
                    )}
                    <CardTitle className="truncate">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag) => (
                      <Badge key={tag._id} variant="secondary">
                        {tag.title}
                      </Badge>
                    ))}
                  </div>
                  {item.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Notes:
                      </h4>
                      <MarkdownViewer
                        content={item.notes}
                        className="text-gray-600"
                      />
                    </div>
                  )}
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: "hsl(var(--primary))" }}
                  >
                    {truncateText(item.link, 50)}
                  </a>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
