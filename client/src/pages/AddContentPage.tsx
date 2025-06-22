import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { PlusIcon } from "@heroicons/react/24/outline";

// Types based on your backend models
type Tag = {
  _id: string;
  title: string;
};

type ContentType = "article" | "video" | "image" | "audio";

const contentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  link: z.string().url("Please enter a valid URL"),
  type: z.enum(["article", "video", "image", "audio"]),
  tags: z.array(z.string()),
});

export function AddContentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [type, setType] = useState<ContentType>("article");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagTitle, setNewTagTitle] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch tags
  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await api.get<Tag[]>("/tag");
      return response.data;
    },
  });

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await api.post<Tag>("/tag", { title });
      return response.data;
    },
    onSuccess: (newTag) => {
      setSelectedTags([...selectedTags, newTag._id]);
      setNewTagTitle("");
      // Invalidate and refetch tags
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (error) => {
      console.error("Error creating tag:", error);
    },
  });

  // Create content mutation
  const createContentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof contentSchema>) => {
      const response = await api.post("/content", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate content queries
      queryClient.invalidateQueries({ queryKey: ["content"] });
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("Error creating content:", error);
    },
  });

  const handleAddTag = () => {
    if (newTagTitle.trim()) {
      createTagMutation.mutate(newTagTitle.trim());
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = contentSchema.parse({
        title,
        link,
        type,
        tags: selectedTags,
      });
      
      createContentMutation.mutate(data);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add New Content</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block mb-2 font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title"
                className={errors.title ? "border-[hsl(var(--destructive))]" : ""}
              />
              {errors.title && (
                <p className="mt-1 text-sm" style={{ color: "hsl(var(--destructive))" }}>
                  {errors.title}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="link" className="block mb-2 font-medium">
                Link
              </label>
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
                className={errors.link ? "border-[hsl(var(--destructive))]" : ""}
              />
              {errors.link && (
                <p className="mt-1 text-sm" style={{ color: "hsl(var(--destructive))" }}>
                  {errors.link}
                </p>
              )}
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Content Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setType("article")}
                  className={`px-4 py-2 rounded-md border ${
                    type === "article"
                      ? "border-[hsl(var(--primary))]"
                      : "border-[hsl(var(--border))]"
                  }`}
                  style={{ 
                    backgroundColor: type === "article" 
                      ? "hsl(var(--primary))" 
                      : "hsl(var(--background))",
                    color: type === "article"
                      ? "hsl(var(--primary-foreground))"
                      : "hsl(var(--foreground))"
                  }}
                >
                  📄 Article
                </button>
                <button
                  type="button"
                  onClick={() => setType("video")}
                  className={`px-4 py-2 rounded-md border ${
                    type === "video"
                      ? "border-[hsl(var(--primary))]"
                      : "border-[hsl(var(--border))]"
                  }`}
                  style={{ 
                    backgroundColor: type === "video" 
                      ? "hsl(var(--primary))" 
                      : "hsl(var(--background))",
                    color: type === "video"
                      ? "hsl(var(--primary-foreground))"
                      : "hsl(var(--foreground))"
                  }}
                >
                  🎬 Video
                </button>
                <button
                  type="button"
                  onClick={() => setType("image")}
                  className={`px-4 py-2 rounded-md border ${
                    type === "image"
                      ? "border-[hsl(var(--primary))]"
                      : "border-[hsl(var(--border))]"
                  }`}
                  style={{ 
                    backgroundColor: type === "image" 
                      ? "hsl(var(--primary))" 
                      : "hsl(var(--background))",
                    color: type === "image"
                      ? "hsl(var(--primary-foreground))"
                      : "hsl(var(--foreground))"
                  }}
                >
                  🖼️ Image
                </button>
                <button
                  type="button"
                  onClick={() => setType("audio")}
                  className={`px-4 py-2 rounded-md border ${
                    type === "audio"
                      ? "border-[hsl(var(--primary))]"
                      : "border-[hsl(var(--border))]"
                  }`}
                  style={{ 
                    backgroundColor: type === "audio" 
                      ? "hsl(var(--primary))" 
                      : "hsl(var(--background))",
                    color: type === "audio"
                      ? "hsl(var(--primary-foreground))"
                      : "hsl(var(--foreground))"
                  }}
                >
                  🎵 Audio
                </button>
              </div>
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <Badge
                    key={tag._id}
                    variant={selectedTags.includes(tag._id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag._id)}
                  >
                    {tag.title}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newTagTitle}
                  onChange={(e) => setNewTagTitle(e.target.value)}
                  placeholder="Add new tag"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!newTagTitle.trim() || createTagMutation.status === "pending"}
                >
                  <PlusIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createContentMutation.status === "pending"}
              >
                {createContentMutation.status === "pending" ? "Saving..." : "Save Content"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}