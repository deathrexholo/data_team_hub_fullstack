import { useState } from "react";
import { User } from "../App";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  BookOpen, 
  Edit2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  GitPullRequest 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PostCard from "@/components/feed/post-card";
import MeetingCard from "@/components/meetings/meeting-card";

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch user's posts
  const { data: userPosts = [] } = useQuery({
    queryKey: [`/api/users/${user.id}/posts`],
  });
  
  // Fetch user's meetings
  const { data: userMeetings = [] } = useQuery({
    queryKey: [`/api/users/${user.id}/meetings`],
  });
  
  // Additional user information (would come from API in a real app)
  const userDetails = {
    bio: "Data Team Lead with 8+ years of experience in data analytics, machine learning, and team leadership. Passionate about transforming data into actionable insights.",
    email: user.email,
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    joinDate: "January 2020",
    education: [
      { degree: "Master of Science in Data Science", school: "Stanford University", year: "2015" },
      { degree: "Bachelor of Science in Computer Science", school: "UC Berkeley", year: "2013" }
    ],
    experience: [
      { role: "Data Team Lead", company: "TeamSync", period: "2020 - Present" },
      { role: "Senior Data Scientist", company: "DataCorp", period: "2017 - 2020" },
      { role: "Data Analyst", company: "Analytics Inc", period: "2015 - 2017" }
    ],
    skillsWithRatings: [
      { name: "Data Analysis", level: 95 },
      { name: "Team Leadership", level: 90 },
      { name: "Python", level: 85 },
      { name: "Machine Learning", level: 80 },
      { name: "SQL", level: 95 },
      { name: "Data Visualization", level: 85 }
    ],
    socialLinks: {
      twitter: "https://twitter.com/sophiachen",
      linkedin: "https://linkedin.com/in/sophiachen",
      github: "https://github.com/sophiachen",
      facebook: "https://facebook.com/sophiachen"
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Profile header */}
      <div className="md:col-span-12">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-primary to-purple-600"></div>
          <div className="px-6 py-4 md:px-8 md:py-6 flex flex-col md:flex-row justify-between items-start md:items-end -mt-20">
            <div className="flex flex-col md:flex-row items-center md:items-end mb-4 md:mb-0">
              <Avatar className="h-32 w-32 border-4 border-white">
                <AvatarImage src={user.profileImage} alt={user.name} />
                <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">{user.title}</p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                  {user.skills && user.skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto flex flex-wrap gap-2 justify-center md:justify-start">
              <Button className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Message
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile content */}
      <div className="md:col-span-8">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{userDetails.bio}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">{userDetails.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">{userDetails.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">{userDetails.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">Joined {userDetails.joinDate}</span>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <a href={userDetails.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Linkedin className="h-5 w-5" />
                    </Button>
                  </a>
                  <a href={userDetails.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="rounded-full text-blue-400 hover:text-blue-500 hover:bg-blue-50">
                      <Twitter className="h-5 w-5" />
                    </Button>
                  </a>
                  <a href={userDetails.socialLinks.github} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="rounded-full text-gray-800 hover:text-gray-900 hover:bg-gray-100">
                      <GitPullRequest className="h-5 w-5" />
                    </Button>
                  </a>
                  <a href={userDetails.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Facebook className="h-5 w-5" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {userDetails.experience.map((exp, idx) => (
                    <div key={idx} className="border-l-2 border-gray-200 pl-4 pb-2">
                      <h3 className="font-medium text-gray-900">{exp.role}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.period}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {userDetails.education.map((edu, idx) => (
                    <div key={idx} className="border-l-2 border-gray-200 pl-4 pb-2">
                      <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.school}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userDetails.skillsWithRatings.map((skill, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                        <span className="text-sm font-medium text-gray-700">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="posts" className="space-y-6">
            {userPosts.length > 0 ? (
              userPosts.map((post: any) => (
                <PostCard key={post.id} post={post} currentUser={user} />
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-10">
                  <p className="text-gray-500">No posts yet</p>
                  <Button className="mt-4">Create Your First Post</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="meetings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                {userMeetings.length > 0 ? (
                  <div className="space-y-4">
                    {userMeetings
                      .filter((meeting: any) => new Date(meeting.date) >= new Date())
                      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((meeting: any) => (
                        <MeetingCard 
                          key={meeting.id} 
                          meeting={meeting} 
                          userId={user.id} 
                          variant="compact" 
                        />
                      ))
                    }
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No upcoming meetings</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Past Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                {userMeetings
                  .filter((meeting: any) => new Date(meeting.date) < new Date())
                  .length > 0 ? (
                  <div className="space-y-4">
                    {userMeetings
                      .filter((meeting: any) => new Date(meeting.date) < new Date())
                      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((meeting: any) => (
                        <MeetingCard 
                          key={meeting.id} 
                          meeting={meeting} 
                          userId={user.id} 
                          variant="compact" 
                        />
                      ))
                    }
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No past meetings</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Sidebar */}
      <div className="md:col-span-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>People you work with</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 2, name: "David Lee", title: "Data Scientist", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=40&h=40" },
                { id: 3, name: "Sarah Williams", title: "Data Analyst", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=40&h=40" },
                { id: 4, name: "Mike Johnson", title: "Data Engineer", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=40&h=40" },
                { id: 5, name: "Emily Taylor", title: "BI Developer", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=40&h=40" }
              ].map(member => (
                <div key={member.id} className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Projects</CardTitle>
            <CardDescription>Active projects you're working on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Data Pipeline Redesign", progress: 75, status: "On Track" },
                { name: "Client Reporting Dashboard", progress: 30, status: "At Risk" },
                { name: "Data Quality Framework", progress: 15, status: "Just Started" }
              ].map((project, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <div>
                      <span className="text-sm font-medium text-gray-800">{project.name}</span>
                      <Badge 
                        variant="outline" 
                        className={`ml-2 ${
                          project.status === "On Track" 
                            ? "bg-green-100 text-green-800" 
                            : project.status === "At Risk" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
                  </div>
                  <Progress 
                    value={project.progress} 
                    className={`h-2 ${
                      project.status === "On Track" 
                        ? "bg-green-100" 
                        : project.status === "At Risk" 
                        ? "bg-yellow-100" 
                        : "bg-purple-100"
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Your accolades and certifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Data Science Certification", issuer: "Google", date: "2022" },
                { title: "AWS Cloud Practitioner", issuer: "Amazon Web Services", date: "2021" },
                { title: "Top Performer Award", issuer: "TeamSync", date: "2023" }
              ].map((achievement, idx) => (
                <div key={idx} className="flex">
                  <div className="flex-shrink-0">
                    <Award className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">{achievement.title}</p>
                    <p className="text-xs text-gray-500">{achievement.issuer} · {achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
