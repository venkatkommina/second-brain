import { FiTrash2, FiExternalLink } from 'react-icons/fi';

interface ContentCardProps {
  content: {
    _id: string;
    title: string;
    link: string;
    type: string;
    tags: string[];
  };
  onDelete: () => void;
}

export default function ContentCard({ content, onDelete }: ContentCardProps) {
  const getTypeIcon = () => {
    switch (content.type) {
      case 'article':
        return '📄';
      case 'video':
        return '🎥';
      case 'image':
        return '🖼️';
      case 'audio':
        return '🎵';
      default:
        return '📎';
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{getTypeIcon()}</span>
            <h3 className="text-lg font-medium text-gray-900">{content.title}</h3>
          </div>
          <div className="flex space-x-2">
            <a
              href={content.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-500"
            >
              <FiExternalLink size={20} />
            </a>
            <button
              onClick={onDelete}
              className="text-red-400 hover:text-red-500"
            >
              <FiTrash2 size={20} />
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {content.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}