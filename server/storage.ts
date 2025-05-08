import { 
  users, User, InsertUser,
  meetings, Meeting, InsertMeeting,
  meetingParticipants, MeetingParticipant, InsertMeetingParticipant,
  posts, Post, InsertPost,
  comments, Comment, InsertComment,
  likes, Like, InsertLike,
  notifications, Notification, InsertNotification 
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;

  // Meeting management
  getMeeting(id: number): Promise<Meeting | undefined>;
  getMeetingsByUser(userId: number): Promise<Meeting[]>;
  getAllMeetings(): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, meetingData: Partial<Meeting>): Promise<Meeting | undefined>;
  deleteMeeting(id: number): Promise<boolean>;

  // Meeting participants
  getMeetingParticipants(meetingId: number): Promise<MeetingParticipant[]>;
  addMeetingParticipant(participant: InsertMeetingParticipant): Promise<MeetingParticipant>;
  updateParticipantStatus(id: number, status: string): Promise<MeetingParticipant | undefined>;
  removeMeetingParticipant(meetingId: number, userId: number): Promise<boolean>;

  // Posts management
  getPost(id: number): Promise<Post | undefined>;
  getAllPosts(): Promise<Post[]>;
  getUserPosts(userId: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, postData: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;

  // Comments management
  getCommentsByPost(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;

  // Likes management
  getLikesByPost(postId: number): Promise<Like[]>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(postId: number, userId: number): Promise<boolean>;
  isPostLikedByUser(postId: number, userId: number): Promise<boolean>;

  // Notifications management
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private meetingsMap: Map<number, Meeting>;
  private meetingParticipantsMap: Map<number, MeetingParticipant>;
  private postsMap: Map<number, Post>;
  private commentsMap: Map<number, Comment>;
  private likesMap: Map<number, Like>;
  private notificationsMap: Map<number, Notification>;
  
  private userIdCounter: number = 1;
  private meetingIdCounter: number = 1;
  private participantIdCounter: number = 1;
  private postIdCounter: number = 1;
  private commentIdCounter: number = 1;
  private likeIdCounter: number = 1;
  private notificationIdCounter: number = 1;

  constructor() {
    this.usersMap = new Map();
    this.meetingsMap = new Map();
    this.meetingParticipantsMap = new Map();
    this.postsMap = new Map();
    this.commentsMap = new Map();
    this.likesMap = new Map();
    this.notificationsMap = new Map();

    // Seed with some initial data
    this.seedInitialData();
  }

  private seedInitialData() {
    const defaultUsers = [
      {
        username: "sophia.chen",
        password: "password123",
        name: "Sophia Chen",
        email: "sophia@teamsync.com",
        title: "Data Team Lead",
        department: "Data Science",
        profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80",
        skills: ["Leadership", "Data Strategy"],
      },
      {
        username: "david.lee",
        password: "password123",
        name: "David Lee",
        email: "david@teamsync.com",
        title: "Data Scientist",
        department: "Data Science",
        profileImage: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=80&h=80",
        skills: ["ML", "Python"],
      },
      {
        username: "sarah.williams",
        password: "password123",
        name: "Sarah Williams",
        email: "sarah@teamsync.com", 
        title: "Data Analyst",
        department: "Analytics",
        profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80",
        skills: ["SQL", "Tableau"],
      },
      {
        username: "mike.johnson",
        password: "password123",
        name: "Mike Johnson",
        email: "mike@teamsync.com",
        title: "Data Engineer",
        department: "Engineering",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80",
        skills: ["ETL", "AWS"],
      }
    ];

    defaultUsers.forEach(user => this.createUser(user as InsertUser));

    // Create a few sample meetings
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.createMeeting({
      title: "Q2 Data Review",
      description: "Quarterly data review meeting",
      date: now,
      duration: 60,
      location: "Conference Room A",
      createdBy: 1
    });

    this.createMeeting({
      title: "Project Kickoff: Data Pipeline",
      description: "Kickoff meeting for new data pipeline project",
      date: new Date(now.setHours(now.getHours() + 4)),
      duration: 90,
      location: "Zoom",
      createdBy: 1
    });

    this.createMeeting({
      title: "Team Weekly Sync",
      description: "Weekly team sync meeting",
      date: new Date(now.setHours(now.getHours() + 2)),
      duration: 60,
      location: "Conference Room B",
      createdBy: 1
    });

    // Add participants to meetings
    [1, 2, 3].forEach(meetingId => {
      [1, 2, 3, 4].forEach(userId => {
        this.addMeetingParticipant({
          meetingId,
          userId,
          status: "accepted"
        });
      });
    });

    // Create some sample posts
    this.createPost({
      content: "We've updated our data pipeline to handle 10x more volume. Check out the architecture diagram and key improvements.",
      userId: 2,
      mediaUrls: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&h=400"]
    });

    this.createPost({
      content: "Our team has analyzed the Q1 results. Here are the key insights and recommendations for the next quarter.",
      userId: 3,
      mediaUrls: ["https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&h=400"]
    });

    this.createPost({
      content: "Check out the photos from our recent team building event. It was a great day of bonding and innovation.",
      userId: 4,
      mediaUrls: [
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&h=400", 
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&h=400"
      ]
    });

    // Add comments to posts
    this.createComment({
      content: "This is impressive! Can you share more details about the throughput improvements?",
      postId: 1,
      userId: 3
    });

    this.createComment({
      content: "Sure, we've achieved ~850k records/min with the new setup. I'll share a detailed report in tomorrow's meeting.",
      postId: 1,
      userId: 2
    });

    this.createComment({
      content: "Great analysis, Sarah! I especially like the proposed optimizations for our data collection process.",
      postId: 2,
      userId: 1
    });

    // Add likes to posts
    [1, 2, 3, 4].forEach(userId => {
      [1, 2, 3].forEach(postId => {
        this.createLike({
          postId,
          userId
        });
      });
    });

    // Add notifications
    this.createNotification({
      userId: 1,
      type: "meeting",
      content: "New meeting scheduled: Client QBR at 2:00 PM today",
      referenceId: 1,
      read: false
    });

    this.createNotification({
      userId: 1,
      type: "comment",
      content: "Michael commented: \"Great insights!\"",
      referenceId: 2,
      read: false
    });

    this.createNotification({
      userId: 1,
      type: "team",
      content: "Alex Johnson joined Data Team",
      referenceId: null,
      read: false
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    
    const user: User = { 
      ...userData, 
      id,
      createdAt
    };
    
    this.usersMap.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }

  // Meeting Management
  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetingsMap.get(id);
  }

  async getMeetingsByUser(userId: number): Promise<Meeting[]> {
    // Get meetings created by user
    const ownedMeetings = Array.from(this.meetingsMap.values()).filter(
      (meeting) => meeting.createdBy === userId
    );

    // Get meetings the user is participating in
    const participatingMeetingIds = Array.from(this.meetingParticipantsMap.values())
      .filter(participant => participant.userId === userId)
      .map(participant => participant.meetingId);

    const participatingMeetings = participatingMeetingIds
      .map(id => this.meetingsMap.get(id))
      .filter((meeting): meeting is Meeting => meeting !== undefined);

    // Combine and deduplicate
    const allMeetings = [...ownedMeetings, ...participatingMeetings];
    const uniqueMeetings = Array.from(new Map(allMeetings.map(meeting => [meeting.id, meeting])).values());
    
    return uniqueMeetings;
  }

  async getAllMeetings(): Promise<Meeting[]> {
    return Array.from(this.meetingsMap.values());
  }

  async createMeeting(meetingData: InsertMeeting): Promise<Meeting> {
    const id = this.meetingIdCounter++;
    const createdAt = new Date();
    
    const meeting: Meeting = { 
      ...meetingData, 
      id,
      createdAt
    };
    
    this.meetingsMap.set(id, meeting);
    return meeting;
  }

  async updateMeeting(id: number, meetingData: Partial<Meeting>): Promise<Meeting | undefined> {
    const meeting = await this.getMeeting(id);
    if (!meeting) return undefined;

    const updatedMeeting = { ...meeting, ...meetingData };
    this.meetingsMap.set(id, updatedMeeting);
    return updatedMeeting;
  }

  async deleteMeeting(id: number): Promise<boolean> {
    return this.meetingsMap.delete(id);
  }

  // Meeting Participants
  async getMeetingParticipants(meetingId: number): Promise<MeetingParticipant[]> {
    return Array.from(this.meetingParticipantsMap.values()).filter(
      (participant) => participant.meetingId === meetingId
    );
  }

  async addMeetingParticipant(participantData: InsertMeetingParticipant): Promise<MeetingParticipant> {
    const id = this.participantIdCounter++;
    
    const participant: MeetingParticipant = { 
      ...participantData, 
      id
    };
    
    this.meetingParticipantsMap.set(id, participant);
    return participant;
  }

  async updateParticipantStatus(id: number, status: string): Promise<MeetingParticipant | undefined> {
    const participant = this.meetingParticipantsMap.get(id);
    if (!participant) return undefined;

    const updatedParticipant = { ...participant, status };
    this.meetingParticipantsMap.set(id, updatedParticipant);
    return updatedParticipant;
  }

  async removeMeetingParticipant(meetingId: number, userId: number): Promise<boolean> {
    const participants = await this.getMeetingParticipants(meetingId);
    const participant = participants.find(p => p.userId === userId);
    
    if (!participant) return false;
    
    return this.meetingParticipantsMap.delete(participant.id);
  }

  // Posts Management
  async getPost(id: number): Promise<Post | undefined> {
    return this.postsMap.get(id);
  }

  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.postsMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    return Array.from(this.postsMap.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createPost(postData: InsertPost): Promise<Post> {
    const id = this.postIdCounter++;
    const createdAt = new Date();
    
    const post: Post = { 
      ...postData, 
      id,
      createdAt
    };
    
    this.postsMap.set(id, post);
    return post;
  }

  async updatePost(id: number, postData: Partial<Post>): Promise<Post | undefined> {
    const post = await this.getPost(id);
    if (!post) return undefined;

    const updatedPost = { ...post, ...postData };
    this.postsMap.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    // Delete associated comments and likes
    const comments = await this.getCommentsByPost(id);
    comments.forEach(comment => this.commentsMap.delete(comment.id));
    
    const likes = await this.getLikesByPost(id);
    likes.forEach(like => this.likesMap.delete(like.id));
    
    return this.postsMap.delete(id);
  }

  // Comments Management
  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return Array.from(this.commentsMap.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const createdAt = new Date();
    
    const comment: Comment = { 
      ...commentData, 
      id,
      createdAt
    };
    
    this.commentsMap.set(id, comment);
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.commentsMap.delete(id);
  }

  // Likes Management
  async getLikesByPost(postId: number): Promise<Like[]> {
    return Array.from(this.likesMap.values())
      .filter(like => like.postId === postId);
  }

  async createLike(likeData: InsertLike): Promise<Like> {
    // Check if user already liked this post
    const existing = Array.from(this.likesMap.values())
      .find(like => like.postId === likeData.postId && like.userId === likeData.userId);
    
    if (existing) return existing;
    
    const id = this.likeIdCounter++;
    const createdAt = new Date();
    
    const like: Like = { 
      ...likeData, 
      id,
      createdAt
    };
    
    this.likesMap.set(id, like);
    return like;
  }

  async deleteLike(postId: number, userId: number): Promise<boolean> {
    const like = Array.from(this.likesMap.values())
      .find(like => like.postId === postId && like.userId === userId);
    
    if (!like) return false;
    
    return this.likesMap.delete(like.id);
  }

  async isPostLikedByUser(postId: number, userId: number): Promise<boolean> {
    return Array.from(this.likesMap.values())
      .some(like => like.postId === postId && like.userId === userId);
  }

  // Notifications Management
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notificationsMap.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const createdAt = new Date();
    
    const notification: Notification = { 
      ...notificationData, 
      id,
      createdAt
    };
    
    this.notificationsMap.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notificationsMap.get(id);
    if (!notification) return undefined;

    const updatedNotification = { ...notification, read: true };
    this.notificationsMap.set(id, updatedNotification);
    return updatedNotification;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.notificationsMap.delete(id);
  }
}

export const storage = new MemStorage();
