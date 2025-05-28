import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../lib/axios';
import ContentCard from '../components/ContentCard';

interface Content {
  _id: string;
  title: string;
  link: string;
  type: string;
  tags: string[];
}

export default function SharedBrain() {
  const { hash } = useParams();

  const { data: contents, isLoading } = useQuery(['shared-brain', hash], async () => {
    const response = await api.get(`/brain/${hash}`);
    return response.data;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shared Brain Contents</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contents?.map((content: Content) => (
              <ContentCard
                key={content._id}
                content={content}
                onDelete={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}