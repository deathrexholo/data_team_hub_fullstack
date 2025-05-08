import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertMeetingSchema, 
  insertMeetingParticipantSchema,
  insertPostSchema,
  insertCommentSchema,
  insertLikeSchema,
  insertNotificationSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // ===== USER ROUTES =====
  
  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Create user
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(validatedData);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Update user
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedUser = await storage.updateUser(id, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Login (simple implementation for demo)
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        title: user.title,
        department: user.department,
        profileImage: user.profileImage,
        skills: user.skills
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // ===== MEETING ROUTES =====
  
  // Get all meetings
  app.get("/api/meetings", async (req, res) => {
    try {
      const meetings = await storage.getAllMeetings();
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  // Get meeting by ID
  app.get("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const meeting = await storage.getMeeting(id);
      
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      res.json(meeting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });

  // Get meetings by user ID
  app.get("/api/users/:userId/meetings", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const meetings = await storage.getMeetingsByUser(userId);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user meetings" });
    }
  });

  // Create meeting
  app.post("/api/meetings", async (req, res) => {
    try {
      const validatedData = insertMeetingSchema.parse(req.body);
      const newMeeting = await storage.createMeeting(validatedData);
      
      // Add creator as participant
      await storage.addMeetingParticipant({
        meetingId: newMeeting.id,
        userId: newMeeting.createdBy,
        status: "accepted"
      });
      
      res.status(201).json(newMeeting);
    } catch (error) {
      res.status(400).json({ message: "Invalid meeting data" });
    }
  });

  // Update meeting
  app.patch("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedMeeting = await storage.updateMeeting(id, req.body);
      
      if (!updatedMeeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      res.json(updatedMeeting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  // Delete meeting
  app.delete("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMeeting(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });

  // ===== MEETING PARTICIPANTS ROUTES =====
  
  // Get participants for a meeting
  app.get("/api/meetings/:meetingId/participants", async (req, res) => {
    try {
      const meetingId = parseInt(req.params.meetingId);
      const participants = await storage.getMeetingParticipants(meetingId);
      
      // Get full user details for each participant
      const participantsWithDetails = await Promise.all(
        participants.map(async (participant) => {
          const user = await storage.getUser(participant.userId);
          return {
            ...participant,
            user
          };
        })
      );
      
      res.json(participantsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  // Add participant to meeting
  app.post("/api/meetings/:meetingId/participants", async (req, res) => {
    try {
      const meetingId = parseInt(req.params.meetingId);
      const validatedData = insertMeetingParticipantSchema.parse({
        ...req.body,
        meetingId
      });
      
      const newParticipant = await storage.addMeetingParticipant(validatedData);
      res.status(201).json(newParticipant);
    } catch (error) {
      res.status(400).json({ message: "Invalid participant data" });
    }
  });

  // Update participant status
  app.patch("/api/meeting-participants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedParticipant = await storage.updateParticipantStatus(id, status);
      
      if (!updatedParticipant) {
        return res.status(404).json({ message: "Participant not found" });
      }
      
      res.json(updatedParticipant);
    } catch (error) {
      res.status(500).json({ message: "Failed to update participant status" });
    }
  });

  // Remove participant from meeting
  app.delete("/api/meetings/:meetingId/participants/:userId", async (req, res) => {
    try {
      const meetingId = parseInt(req.params.meetingId);
      const userId = parseInt(req.params.userId);
      
      const removed = await storage.removeMeetingParticipant(meetingId, userId);
      
      if (!removed) {
        return res.status(404).json({ message: "Participant not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove participant" });
    }
  });

  // ===== POST ROUTES =====
  
  // Get all posts
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      
      // Get author details and enrichment data for each post
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          const author = await storage.getUser(post.userId);
          const comments = await storage.getCommentsByPost(post.id);
          const likes = await storage.getLikesByPost(post.id);
          
          return {
            ...post,
            author,
            commentsCount: comments.length,
            likesCount: likes.length
          };
        })
      );
      
      res.json(enrichedPosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Get post by ID
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const author = await storage.getUser(post.userId);
      const comments = await storage.getCommentsByPost(post.id);
      const likes = await storage.getLikesByPost(post.id);
      
      res.json({
        ...post,
        author,
        comments,
        likes
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Get posts by user ID
  app.get("/api/users/:userId/posts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const posts = await storage.getUserPosts(userId);
      
      // Enrich posts with comments and likes counts
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          const comments = await storage.getCommentsByPost(post.id);
          const likes = await storage.getLikesByPost(post.id);
          
          return {
            ...post,
            commentsCount: comments.length,
            likesCount: likes.length
          };
        })
      );
      
      res.json(enrichedPosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  // Create post
  app.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const newPost = await storage.createPost(validatedData);
      
      const author = await storage.getUser(newPost.userId);
      
      res.status(201).json({
        ...newPost,
        author,
        commentsCount: 0,
        likesCount: 0
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid post data" });
    }
  });

  // Update post
  app.patch("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedPost = await storage.updatePost(id, req.body);
      
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  // Delete post
  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePost(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // ===== COMMENT ROUTES =====
  
  // Get comments for a post
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getCommentsByPost(postId);
      
      // Enrich comments with author details
      const enrichedComments = await Promise.all(
        comments.map(async (comment) => {
          const author = await storage.getUser(comment.userId);
          return {
            ...comment,
            author
          };
        })
      );
      
      res.json(enrichedComments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create comment
  app.post("/api/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        postId
      });
      
      const newComment = await storage.createComment(validatedData);
      const author = await storage.getUser(newComment.userId);
      
      // Create notification for post author
      const post = await storage.getPost(postId);
      if (post && post.userId !== newComment.userId) {
        const commentAuthor = await storage.getUser(newComment.userId);
        await storage.createNotification({
          userId: post.userId,
          type: "comment",
          content: `${commentAuthor?.name} commented on your post`,
          referenceId: postId,
          read: false
        });
      }
      
      res.status(201).json({
        ...newComment,
        author
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  // Delete comment
  app.delete("/api/comments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteComment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // ===== LIKE ROUTES =====
  
  // Like a post
  app.post("/api/posts/:postId/likes", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const validatedData = insertLikeSchema.parse({
        postId,
        userId: parseInt(userId)
      });
      
      const newLike = await storage.createLike(validatedData);
      
      // Create notification for post author
      const post = await storage.getPost(postId);
      if (post && post.userId !== validatedData.userId) {
        const user = await storage.getUser(validatedData.userId);
        await storage.createNotification({
          userId: post.userId,
          type: "like",
          content: `${user?.name} liked your post`,
          referenceId: postId,
          read: false
        });
      }
      
      res.status(201).json(newLike);
    } catch (error) {
      res.status(400).json({ message: "Invalid like data" });
    }
  });

  // Unlike a post
  app.delete("/api/posts/:postId/likes/:userId", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const userId = parseInt(req.params.userId);
      
      const deleted = await storage.deleteLike(postId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Like not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete like" });
    }
  });

  // Check if user liked a post
  app.get("/api/posts/:postId/likes/:userId", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const userId = parseInt(req.params.userId);
      
      const isLiked = await storage.isPostLikedByUser(postId, userId);
      res.json({ isLiked });
    } catch (error) {
      res.status(500).json({ message: "Failed to check like status" });
    }
  });

  // ===== NOTIFICATION ROUTES =====
  
  // Get notifications for a user
  app.get("/api/users/:userId/notifications", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedNotification = await storage.markNotificationAsRead(id);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  // Create notification
  app.post("/api/notifications", async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const newNotification = await storage.createNotification(validatedData);
      res.status(201).json(newNotification);
    } catch (error) {
      res.status(400).json({ message: "Invalid notification data" });
    }
  });

  // Delete notification
  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNotification(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  return httpServer;
}
