import React, { useState, useRef, useEffect } from 'react';
import { Comment, User } from '../../../types';
import { MessageSquare, Sparkles, User as UserIcon, Send } from 'lucide-react';

interface CommentSectionProps {
  comments: Comment[];
  currentUser: User | null;
  onPostComment: (text: string) => Promise<void>;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, currentUser, onPostComment }) => {
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setIsPosting(true);
    try {
      await onPostComment(newComment);
      setNewComment('');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="border-t border-slate-200 pt-6 mt-6">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
        <MessageSquare size={16} /> Activity & Comments
      </h3>
      
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[150px] max-h-[300px] overflow-y-auto mb-4 space-y-4">
        {(!comments || comments.length === 0) && (
          <div className="text-center text-slate-400 text-sm py-4">No comments yet. Be the first to start the discussion.</div>
        )}
        {comments?.map((comment) => (
          <div key={comment.id} className={`flex gap-3 ${comment.userId === currentUser?.id ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
              {comment.isSystem ? (
                <Sparkles size={12} className="text-slate-500" />
              ) : comment.userAvatar ? (
                  <img src={comment.userAvatar} alt="u" className="w-full h-full object-cover" />
              ) : (
                  <UserIcon className="p-1.5 text-slate-500" />
              )}
            </div>
            <div className={`max-w-[80%] ${comment.userId === currentUser?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`p-3 rounded-lg text-sm ${
                  comment.isSystem ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                  comment.userId === currentUser?.id ? 'bg-blue-600 text-white rounded-tr-none' : 
                  'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                }`}>
                  {comment.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  {comment.isSystem ? 'System' : comment.userName} • {new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>
          </div>
        ))}
        <div ref={commentsEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Type a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button 
            type="submit"
            disabled={isPosting || !newComment.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
      </form>
    </div>
  );
};

export default CommentSection;
