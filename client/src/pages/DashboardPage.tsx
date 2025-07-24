import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import ShareModal from "../components/ShareModal";
import EditContentModal from "../components/EditContentModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import ContentCard from "../components/ContentCard";
import { PlusIcon, ShareIcon, PauseIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

// Types based on your backend models
type Tag = {
  _id: string;
  title: string;
  userId?: string;
  isGlobal?: boolean;
};

type Content = {
  _id: string;
  link: string;
  type: "image" | "video" | "article" | "audio";
  title: string;
  notes?: string; // Optional notes field
  isShared?: boolean; // Optional sharing status
  tags: Tag[];
  userId: string;
};

export function DashboardPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);
  const [isInitiatingShare, setIsInitiatingShare] = useState(false);

  const queryClient = useQueryClient();

  // Share brain mutation
  const shareMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/brain/share");
      return response.data;
    },
    onSuccess: (data) => {
      const hash = data.link?.split("/brain/")[1] || "";
      const frontendLink = `${window.location.origin}/brain/${hash}`;
      setShareLink(frontendLink);
      setIsSharing(data.isPublic);

      // Show modal with the share link or status, not options
      setShowShareModal(true);
      setIsInitiatingShare(false);

      queryClient.invalidateQueries({ queryKey: ["brain-sharing-status"] });
    },
    onError: () => {
      toast.error("Failed to toggle brain sharing");
    },
  });

  // Share all content mutation
  const shareAllMutation = useMutation({
    mutationFn: async () => {
      await api.post("/content/share-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      // After sharing all content, activate brain sharing
      shareMutation.mutate();
    },
    onError: () => {
      toast.error("Failed to share all content");
    },
  });

  // Handler for the main "Share Brain" button
  const handleShareBrainClick = () => {
    // If brain is already shared, clicking again will disable it
    if (isSharing) {
      shareMutation.mutate();
      return;
    }
    // If not shared, open the modal to ask for sharing preference
    setShowShareModal(true);
    setIsInitiatingShare(true);
  };

  // Delete content mutation
  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: string) => {
      await api.delete(`/content/${contentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
    onError: () => {
      toast.error("Failed to delete content");
    },
  });

  // Toggle content sharing mutation
  const toggleShareMutation = useMutation({
    mutationFn: async ({
      contentId,
      isShared,
    }: {
      contentId: string;
      isShared: boolean;
    }) => {
      await api.patch(`/content/${contentId}/share`, { isShared });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
    onError: () => {
      toast.error("Failed to toggle content sharing");
    },
  });

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

  // Check if brain is currently being shared
  const { data: sharingStatus } = useQuery({
    queryKey: ["brain-sharing-status"],
    queryFn: async () => {
      try {
        const response = await api.get("/brain/status");
        return response.data;
      } catch (error) {
        console.error("Error fetching sharing status:", error);
        return { isPublic: false };
      }
    },
  });

  // Update local state when sharing status is fetched
  useEffect(() => {
    if (sharingStatus) {
      setIsSharing(sharingStatus.isPublic);
      if (sharingStatus.isPublic && sharingStatus.link) {
        const hash = sharingStatus.link.split("/brain/")[1] || "";
        const frontendLink = `${window.location.origin}/brain/${hash}`;
        setShareLink(frontendLink);
      }
    }
  }, [sharingStatus]);

  // Handler functions
  const handleEditContent = (content: Content) => {
    setEditingContent(content);
    setShowEditModal(true);
  };

  const handleDeleteContent = (contentId: string) => {
    setContentToDelete(contentId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (contentToDelete) {
      deleteContentMutation.mutate(contentToDelete);
      setContentToDelete(null);
    }
  };

  const handleToggleShare = (content: Content) => {
    toggleShareMutation.mutate({
      contentId: content._id,
      isShared: !content.isShared,
    });
  };

  const handleShareAll = () => {
    setShowShareModal(false); // Close modal first
    setIsInitiatingShare(false); // Reset state
    shareAllMutation.mutate();
  };

  const handleShareSelected = () => {
    setShowShareModal(false); // Close modal first
    setIsInitiatingShare(false); // Reset state
    // Enable brain sharing with current selected items
    shareMutation.mutate();
  };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Your Brain</h1>
        <div className="flex gap-3">
          <Button
            onClick={handleShareBrainClick}
            variant="outline"
            disabled={shareMutation.isPending}
          >
            {isSharing ? (
              <>
                <PauseIcon className="h-5 w-5 mr-2" />
                {shareMutation.isPending ? "Updating..." : "Brain Active"}
              </>
            ) : (
              <>
                <ShareIcon className="h-5 w-5 mr-2" />
                {shareMutation.isPending ? "Sharing..." : "Share Brain"}
              </>
            )}
          </Button>
          <Link to="/content/new">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Content
            </Button>
          </Link>
        </div>
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
        <div className="hidden md:flex gap-2">
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
            <ContentCard
              key={item._id}
              content={item}
              onDelete={() => handleDeleteContent(item._id)}
              onEdit={() => handleEditContent(item)}
              onToggleShare={() => handleToggleShare(item)}
            />
          ))}
        </div>
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setIsInitiatingShare(false);
        }}
        shareLink={shareLink}
        isSharing={isSharing}
        onShareAll={handleShareAll}
        onShareSelected={handleShareSelected}
        showOptions={isInitiatingShare}
      />

      <EditContentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        content={editingContent}
        tags={tags}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteContentMutation.isPending}
      />
    </div>
  );
}
