import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import ContentCard from "../components/ContentCard";

interface Content {
  _id: string;
  title: string;
  link: string;
  type: string;
  tags: Array<{
    _id: string;
    title: string;
    userId?: string;
    isGlobal?: boolean;
  }>;
  notes?: string;
}

export default function SharedBrain() {
  const { hash } = useParams();

  const {
    data: contents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shared-brain", hash],
    queryFn: async () => {
      const response = await api.get(`/brain/${hash}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shared brain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Brain Not Found
          </h2>
          <p className="text-muted-foreground">
            This brain is either private or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Shared Brain</h1>
            <p className="text-muted-foreground mt-2">
              Exploring someone's curated knowledge collection
            </p>
          </div>

          {contents && contents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {contents.map((content: Content) => (
                <ContentCard
                  key={content._id}
                  content={content}
                  onDelete={() => {}} // Read-only mode
                  readOnly={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                This brain doesn't have any content yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
