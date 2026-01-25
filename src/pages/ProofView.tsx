import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ProofLink, ProofComment, Design } from '../types';
import { Loader2, MessageCircle, ThumbsUp, AlertCircle } from 'lucide-react';

export function ProofView() {
  const { token } = useParams<{ token: string }>();
  const [proofLink, setProofLink] = useState<ProofLink | null>(null);
  const [design, setDesign] = useState<Design | null>(null);
  const [comments, setComments] = useState<ProofComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentStatus, setCommentStatus] = useState<'comment' | 'approved' | 'change_requested'>('comment');
  const [authorName, setAuthorName] = useState('');

  useEffect(() => {
    loadProof();
  }, [token]);

  const loadProof = async () => {
    const { data: proofData, error: proofError } = await supabase
      .from('proof_links')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (proofError || !proofData) {
      setLoading(false);
      return;
    }

    if (proofData.expires_at && new Date(proofData.expires_at) < new Date()) {
      setLoading(false);
      return;
    }

    setProofLink(proofData);

    await supabase
      .from('proof_links')
      .update({
        view_count: proofData.view_count + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', proofData.id);

    const { data: designData } = await supabase
      .from('designs')
      .select('*')
      .eq('id', proofData.design_id)
      .maybeSingle();

    setDesign(designData);

    const { data: commentsData } = await supabase
      .from('proof_comments')
      .select('*')
      .eq('proof_link_id', proofData.id)
      .order('created_at', { ascending: true });

    setComments(commentsData || []);
    setLoading(false);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || !proofLink) return;

    const { error } = await supabase.from('proof_comments').insert({
      proof_link_id: proofLink.id,
      author_user_id: null,
      author_name: authorName || 'Anonymous',
      comment: newComment,
      status: commentStatus,
      is_internal: false,
    });

    if (!error) {
      setNewComment('');
      setAuthorName('');
      await loadProof();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!proofLink || !design) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Proof Not Found</h1>
          <p className="text-gray-600">This proof link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{proofLink.title || 'Design Proof'}</h1>
          {proofLink.message && (
            <p className="text-gray-600 mb-6">{proofLink.message}</p>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Design Preview</h2>
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                {design.preview_png_url ? (
                  <img
                    src={design.preview_png_url}
                    alt={design.name}
                    className="max-w-full max-h-[600px] object-contain"
                  />
                ) : (
                  <span className="text-gray-400">No preview available</span>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Size:</strong> {design.width_in}" × {design.height_in}"
                </div>
                <div>
                  <strong>Product:</strong> {design.product_type}
                </div>
                <div>
                  <strong>Status:</strong> {design.status}
                </div>
                <div>
                  <strong>Views:</strong> {proofLink.view_count}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments & Feedback</h2>

              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {comment.status === 'approved' && (
                          <ThumbsUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                        )}
                        {comment.status === 'change_requested' && (
                          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                        )}
                        {comment.status === 'comment' && (
                          <MessageCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900">
                              {comment.author_name || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={submitComment} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Feedback Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCommentStatus('comment')}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 ${
                        commentStatus === 'comment'
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      Comment
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommentStatus('approved')}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 ${
                        commentStatus === 'approved'
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommentStatus('change_requested')}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 ${
                        commentStatus === 'change_requested'
                          ? 'border-orange-600 bg-orange-50 text-orange-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      Changes
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Your Feedback
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="Share your thoughts on this design..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Submit Feedback
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
