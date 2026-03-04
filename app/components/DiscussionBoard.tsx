"use client";
import { useState, useEffect } from "react";

interface DiscussionPost {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  replies: DiscussionPost[];
}

interface DiscussionBoardProps {
  title: string;
  prompt: string;
  storageKey: string;
}

export default function DiscussionBoard({ title, prompt, storageKey }: DiscussionBoardProps) {
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(`discussion:${storageKey}`);
    if (stored) setPosts(JSON.parse(stored));

    const user = localStorage.getItem("user:name");
    if (user) {
      setUserName(user);
      setIsLoggedIn(true);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(`discussion:${storageKey}`, JSON.stringify(posts));
  }, [posts, storageKey]);

  function addPost() {
    if (!newPost.trim() || !isLoggedIn) return;

    const post: DiscussionPost = {
      id: Date.now().toString(),
      author: userName,
      content: newPost.trim(),
      timestamp: new Date().toLocaleString(),
      replies: [],
    };

    setPosts([post, ...posts]);
    setNewPost("");
  }

  function addReply(parentId: string) {
    if (!replyContent.trim() || !isLoggedIn) return;

    const reply: DiscussionPost = {
      id: Date.now().toString(),
      author: userName,
      content: replyContent.trim(),
      timestamp: new Date().toLocaleString(),
      replies: [],
    };

    function addReplyToPost(posts: DiscussionPost[]): DiscussionPost[] {
      return posts.map((post) => {
        if (post.id === parentId) {
          return { ...post, replies: [reply, ...post.replies] };
        }
        return { ...post, replies: addReplyToPost(post.replies) };
      });
    }

    setPosts(addReplyToPost(posts));
    setReplyContent("");
    setReplyingTo(null);
  }

  function PostItem({ post, depth = 0 }: { post: DiscussionPost; depth?: number }) {
    const [showReplies, setShowReplies] = useState(true);

    return (
      <div className={`${depth > 0 ? "ml-6 border-l-2 border-slate-200 pl-4" : ""}`}>
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">{post.author}</p>
              <p className="text-xs text-slate-500">{post.timestamp}</p>
            </div>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">{post.content}</p>

          {isLoggedIn && depth < 2 && (
            <button
              onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              Reply
            </button>
          )}

          {replyingTo === post.id && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={() => addReply(post.id)}
                className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          )}

          {post.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="mt-2 text-xs text-slate-500 hover:text-slate-700"
            >
              {showReplies ? "Hide" : "Show"} {post.replies.length} {post.replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {showReplies && post.replies.length > 0 && (
          <div className="space-y-2">
            {post.replies.map((reply) => (
              <PostItem key={reply.id} post={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-purple-600 px-6 py-4">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <p className="text-purple-100 text-sm mt-1">{prompt}</p>
      </div>

      <div className="p-6">
        {isLoggedIn ? (
          <div className="mb-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full text-sm border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
            <button
              onClick={addPost}
              disabled={!newPost.trim()}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500 bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
            Please log in to participate in the discussion.
          </p>
        )}

        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">No posts yet. Be the first to share!</p>
          ) : (
            posts.map((post) => <PostItem key={post.id} post={post} />)
          )}
        </div>
      </div>
    </div>
  );
}
