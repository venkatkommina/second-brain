import {
  FiTrash2,
  FiExternalLink,
  FiEdit2,
  FiShare2,
  FiEyeOff,
  FiGlobe,
} from "react-icons/fi";
import { MarkdownViewer } from "./MarkdownViewer";

interface ContentCardProps {
  content: {
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
    notes?: string; // Optional notes field
    isShared?: boolean; // Optional sharing status
  };
  onDelete: () => void;
  onEdit?: () => void; // Optional edit handler
  onToggleShare?: () => void; // Optional share toggle handler
  readOnly?: boolean; // Optional read-only mode
}

export default function ContentCard({
  content,
  onDelete,
  onEdit,
  onToggleShare,
  readOnly = false,
}: ContentCardProps) {
  const getTypeIcon = () => {
    switch (content.type) {
      case "article":
        return "📄";
      case "video":
        return "🎥";
      case "image":
        return "🖼️";
      case "audio":
        return "🎵";
      default:
        return "📎";
    }
  };

  return (
    <div className="bg-card border border-border overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{getTypeIcon()}</span>
            <h3 className="text-lg font-medium text-card-foreground">
              {content.title}
            </h3>
          </div>
          <div className="flex space-x-2">
            <a
              href={content.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
              title="Open link"
            >
              <FiExternalLink size={20} />
            </a>
            {!readOnly && (
              <>
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Edit content"
                  >
                    <FiEdit2 size={20} />
                  </button>
                )}
                {onToggleShare && (
                  <button
                    onClick={onToggleShare}
                    className={`${
                      content.isShared
                        ? "text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title={content.isShared ? "Stop sharing" : "Share content"}
                  >
                    {content.isShared ? (
                      <FiShare2 size={20} />
                    ) : (
                      <FiEyeOff size={20} />
                    )}
                  </button>
                )}
                <button
                  onClick={onDelete}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete content"
                >
                  <FiTrash2 size={20} />
                </button>
              </>
            )}
          </div>
        </div>
        {content.notes && (
          <div className="mt-3 pt-3 border-t border-border">
            <h4 className="text-sm font-medium text-card-foreground mb-2">
              Notes:
            </h4>
            <MarkdownViewer
              content={content.notes}
              className="text-muted-foreground"
            />
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {content.tags.map((tag) => (
            <span
              key={tag._id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              {tag.title}
            </span>
          ))}
          {content.isShared && !readOnly && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800">
              <FiGlobe className="w-3 h-3" />
              Shared
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
