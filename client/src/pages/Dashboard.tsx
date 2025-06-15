import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import AddContentModal from '../components/AddContentModal';
import ContentCard from '../components/ContentCard';
import { FiPlus, FiShare2 } from 'react-icons/fi';

interface Content {
  _id: string;
  title: string;
  link: string;
  type: string;
  tags: string[];
}

export default function Dashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const { data: contents, isLoading } = useQuery('contents', async () => {
    const response = await api.get('/content');
    return response.data;
  });

  const { data: tags } = useQuery('tags', async () => {
    const response = await api.get('/tag');
    return response.data;
  });

  const shareMutation = useMutation(
    async () => {
      const response = await api.post('/brain/share');
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success(data.message);
        if (data.link) {
          navigator.clipboard.writeText(data.link);
          toast.success('Share link copied to clipboard!');
        }
      },
    }
  );

  const deleteContent = useMutation(
    async (contentId: string) => {
      await api.delete(`/content/${contentId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contents');
        toast.success('Content deleted successfully');
      },
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Second Brain</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => shareMutation.mutate()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <FiShare2 className="mr-2" />
                Share Brain
              </button>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FiPlus className="mr-2" />
            Add Content
          </button>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contents?.map((content: Content) => (
              <ContentCard
                key={content._id}
                content={content}
                onDelete={() => deleteContent.mutate(content._id)}
              />
            ))}
          </div>
        </div>
      </main>

      <AddContentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tags={tags || []}
      />
    </div>
  );
}