import { useState, ChangeEvent } from "react";
import { Image, File, BarChart2, Link as LinkIcon, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User } from "../../App";

interface PostFormProps {
  user: User;
}

const PostForm: React.FC<PostFormProps> = ({ user }) => {
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string, userId: number, mediaUrls: string[] }) => {
      const response = await apiRequest("POST", "/api/posts", data);
      return response.json();
    },
    onSuccess: () => {
      setContent("");
      setMediaUrls([]);
      setPreviewUrls([]);
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Success",
        description: "Your post has been published",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    createPostMutation.mutate({
      content,
      userId: user.id,
      mediaUrls
    });
  };

  const handleMediaAdd = (url: string) => {
    if (url && !mediaUrls.includes(url)) {
      setMediaUrls([...mediaUrls, url]);
      setPreviewUrls([...previewUrls, url]);
    }
  };

  const handleMediaRemove = (index: number) => {
    const newMediaUrls = [...mediaUrls];
    const newPreviewUrls = [...previewUrls];
    newMediaUrls.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    setMediaUrls(newMediaUrls);
    setPreviewUrls(newPreviewUrls);
  };

  const handleAddPlaceholderImage = () => {
    // For demo purposes, add placeholder images from a common stock photo service
    const placeholderImages = [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&h=400",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&h=400",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&h=400",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&h=400"
    ];
    
    const randomIndex = Math.floor(Math.random() * placeholderImages.length);
    handleMediaAdd(placeholderImages[randomIndex]);
  };

  const handleAddChart = () => {
    // For demo purposes, add a chart placeholder
    handleMediaAdd("https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&h=400");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={user.profileImage} alt={user.name} />
            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              placeholder="Share an update, insight or resource..."
              className="w-full resize-none border-gray-300 focus:border-primary"
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            {previewUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={url} 
                      alt={`Media preview ${index}`} 
                      className="rounded-lg w-full object-cover h-40"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm"
                      onClick={() => handleMediaRemove(index)}
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-primary transition-colors"
                  onClick={handleAddPlaceholderImage}
                >
                  <Image className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-primary transition-colors"
                  onClick={() => toast({
                    title: "Feature not implemented",
                    description: "File upload not available in demo",
                  })}
                >
                  <File className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-primary transition-colors"
                  onClick={handleAddChart}
                >
                  <BarChart2 className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-primary transition-colors"
                  onClick={() => toast({
                    title: "Feature not implemented",
                    description: "Link sharing not available in demo",
                  })}
                >
                  <LinkIcon className="h-5 w-5" />
                </Button>
              </div>
              
              <Button
                type="submit"
                className="bg-primary hover:bg-blue-600 text-white shadow-sm"
                disabled={!content.trim() || createPostMutation.isPending}
              >
                {createPostMutation.isPending ? "Posting..." : "Post Update"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
