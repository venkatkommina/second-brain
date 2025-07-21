import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";
import toast from "react-hot-toast";
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

  if (!content) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-border p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  Edit Content
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="link"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Link
                    </label>
                    <input
                      type="url"
                      id="link"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="type"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Type
                    </label>
                    <select
                      id="type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="article">Article</option>
                      <option value="video">Video</option>
                      <option value="image">Image</option>
                      <option value="audio">Audio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Notes (Markdown supported)
                    </label>
                    <MarkdownEditor
                      value={notes}
                      onChange={setNotes}
                      height={200}
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isShared"
                        checked={isShared}
                        onChange={(e) => setIsShared(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="isShared"
                        className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        Share this content publicly
                      </label>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      When enabled, this content will be visible in your shared
                      brain
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Tags
                    </label>
                    <div className="mt-2 space-y-2">
                      {tags.map((tag) => (
                        <label
                          key={tag._id}
                          className="inline-flex items-center mr-4"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTags([...selectedTags, tag._id]);
                              } else {
                                setSelectedTags(
                                  selectedTags.filter((id) => id !== tag._id)
                                );
                              }
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                            {tag.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateContent.isPending}
                      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {updateContent.isPending
                        ? "Updating..."
                        : "Update Content"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
