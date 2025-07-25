import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XMarkIcon } from "@heroicons/react/24/outline";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";
import { MarkdownEditor } from "./MarkdownEditor";

interface Tag {
  _id: string;
  title: string;
}

interface Content {
  _id: string;
  title: string;
  link: string;
  type: string;
  notes?: string;
  isShared?: boolean;
  tags: Tag[];
}

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  tags: Tag[];
}

export default function EditContentModal({
  isOpen,
  onClose,
  content,
  tags,
}: EditContentModalProps) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [type, setType] = useState("article");
  const [notes, setNotes] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Populate form when content changes
  useEffect(() => {
    if (content) {
      setTitle(content.title);
      setLink(content.link);
      setType(content.type);
      setNotes(content.notes || "");
      setIsShared(content.isShared || false);
      setSelectedTags(content.tags.map((tag) => tag._id));
    }
  }, [content]);

  const updateContent = useMutation({
    mutationFn: async () => {
      if (!content) throw new Error("No content to update");

      await api.put(`/content/${content._id}`, {
        title,
        link,
        type,
        notes,
        isShared,
        tags: selectedTags,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Content updated successfully");
      onClose();
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update content";
      toast.error(errorMessage);
    },
  });

  const resetForm = () => {
    setTitle("");
    setLink("");
    setType("article");
    setNotes("");
    setIsShared(false);
    setSelectedTags([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateContent.mutate();
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (!content) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0"
            style={{ backgroundColor: "hsl(var(--background) / 0.8)" }}
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="w-full max-w-2xl transform overflow-hidden rounded-lg border shadow-xl transition-all"
                style={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between p-6 border-b"
                  style={{ borderColor: "hsl(var(--border))" }}
                >
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold"
                    style={{ color: "hsl(var(--foreground))" }}
                  >
                    Edit Content
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="rounded-md p-2 hover:opacity-70 transition-opacity"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                      <label
                        htmlFor="title"
                        className="block mb-2 font-medium"
                        style={{ color: "hsl(var(--foreground))" }}
                      >
                        Title
                      </label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a descriptive title"
                        required
                      />
                    </div>

                    {/* Link */}
                    <div>
                      <label
                        htmlFor="link"
                        className="block mb-2 font-medium"
                        style={{ color: "hsl(var(--foreground))" }}
                      >
                        Link
                      </label>
                      <Input
                        id="link"
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://example.com"
                        required
                      />
                    </div>

                    {/* Content Type */}
                    <div>
                      <label
                        className="block mb-2 font-medium"
                        style={{ color: "hsl(var(--foreground))" }}
                      >
                        Content Type
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { value: "article", label: "📄 Article" },
                          { value: "video", label: "🎬 Video" },
                          { value: "image", label: "🖼️ Image" },
                          { value: "audio", label: "🎵 Audio" },
                        ].map((contentType) => (
                          <button
                            key={contentType.value}
                            type="button"
                            onClick={() => setType(contentType.value)}
                            className={`px-4 py-2 rounded-md border transition-colors ${
                              type === contentType.value
                                ? "border-[hsl(var(--primary))]"
                                : "border-[hsl(var(--border))]"
                            }`}
                            style={{
                              backgroundColor:
                                type === contentType.value
                                  ? "hsl(var(--primary))"
                                  : "hsl(var(--background))",
                              color:
                                type === contentType.value
                                  ? "hsl(var(--primary-foreground))"
                                  : "hsl(var(--foreground))",
                            }}
                          >
                            {contentType.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label
                        className="block mb-2 font-medium"
                        style={{ color: "hsl(var(--foreground))" }}
                      >
                        Notes{" "}
                        <span
                          className="font-normal"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                        >
                          (Optional)
                        </span>
                      </label>
                      <MarkdownEditor
                        value={notes}
                        onChange={setNotes}
                        placeholder="Add your notes in Markdown format..."
                        height={200}
                      />
                    </div>

                    {/* Share Toggle */}
                    <div
                      className="rounded-lg border p-4"
                      style={{
                        backgroundColor: "hsl(var(--muted) / 0.3)",
                        borderColor: "hsl(var(--border))",
                      }}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isShared"
                          checked={isShared}
                          onChange={(e) => setIsShared(e.target.checked)}
                          className="h-4 w-4 rounded focus:ring-2"
                          style={{
                            accentColor: "hsl(var(--primary))",
                          }}
                        />
                        <label
                          htmlFor="isShared"
                          className="ml-3 font-medium"
                          style={{ color: "hsl(var(--foreground))" }}
                        >
                          Share this content publicly
                        </label>
                      </div>
                      <p
                        className="mt-1 text-sm ml-7"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        When enabled, this content will be visible in your
                        shared brain
                      </p>
                    </div>

                    {/* Tags */}
                    <div>
                      <label
                        className="block mb-3 font-medium"
                        style={{ color: "hsl(var(--foreground))" }}
                      >
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag._id}
                            variant={
                              selectedTags.includes(tag._id)
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer transition-all hover:scale-105"
                            onClick={() => toggleTag(tag._id)}
                          >
                            {tag.title}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" isLoading={updateContent.isPending}>
                        {updateContent.isPending
                          ? "Updating..."
                          : "Update Content"}
                      </Button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
