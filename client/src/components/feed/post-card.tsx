import { useState } from "react";
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { User } from "../../App";

interface PostCardProps {
  post: {
    id: number;
    content: string;
    mediaUrls: string[];
    createdAt: string;
    author: {
      id: number;
      name: string;
      title: string;
      profileImage: string;
    };
    commentsCount: number;
    likesCount: number;
  };
  currentUser: User;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: [`/api/posts/${post.id}/comments`],
    enabled: showComments,
  });

  const { data: likeStatus } = useQuery({
    queryKey: [`/api/posts/${post.id}/likes/${currentUser.id}`],
  });

  const isLiked = likeStatus?.isLiked;

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/posts/${post.id}/likes/${currentUser.id}`, null);
      } else {
        await apiRequest("POST", `/api/posts/${post.id}/likes`, { userId: currentUser.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/likes/${currentUser.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/posts/${post.id}/comments`, {
        content,
        userId: currentUser.id
      });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    }
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      commentMutation.mutate(newComment);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-start">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={post.author.profileImage} alt={post.author.name} />
          <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">{post.author.name}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })} · {post.author.title}
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-500">
              <MoreHorizontal size={18} />
            </button>
          </div>
          
          <div className="mt-3">
            <p className="text-gray-700">{post.content}</p>
            
            {post.mediaUrls.length > 0 && (
              post.mediaUrls.length === 1 ? (
                <img 
                  src={post.mediaUrls[0]} 
                  alt="Post media" 
                  className="mt-3 rounded-lg w-full object-cover max-h-96"
                />
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {post.mediaUrls.map((url, index) => (
                    <img 
                      key={index}
                      src={url} 
                      alt={`Post media ${index + 1}`} 
                      className="rounded-lg w-full object-cover h-40"
                    />
                  ))}
                </div>
              )
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className={cn(
                  "flex items-center text-gray-600 hover:text-blue-600 transition-colors",
                  isLiked && "text-blue-600"
                )}
                onClick={handleLike}
                disabled={likeMutation.isPending}
              >
                <ThumbsUp className={cn("mr-1.5 h-4 w-4", isLiked && "fill-current")} />
                <span className="text-sm">{post.likesCount} Likes</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                onClick={toggleComments}
              >
                <MessageSquare className="mr-1.5 h-4 w-4" />
                <span className="text-sm">{post.commentsCount} Comments</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Share2 className="mr-1.5 h-4 w-4" />
                <span className="text-sm">Share</span>
              </Button>
            </div>
            
            <Button 
              variant="link" 
              className="text-primary hover:text-blue-600 text-sm font-medium"
            >
              View Details
            </Button>
          </div>
          
          {showComments && (
            <div className="mt-4 pt-4 border-t">
              {comments.length > 0 ? (
                comments.map((comment: any) => (
                  <div key={comment.id} className="flex items-start mb-4">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={comment.author.profileImage} alt={comment.author.name} />
                      <AvatarFallback>{comment.author.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-0 bg-gray-100 rounded-lg px-4 py-2">
                      <p className="font-medium text-sm text-gray-800">{comment.author.name}</p>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">No comments yet</p>
              )}
              
              <form onSubmit={handleComment} className="flex items-center mt-3">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={currentUser.profileImage} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex">
                  <Input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 mr-2"
                  />
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={commentMutation.isPending || !newComment.trim()}
                  >
                    {commentMutation.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
