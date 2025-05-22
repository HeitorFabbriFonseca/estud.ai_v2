import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@/providers/user-provider";
import { useGoogleCalendar } from "@/hooks/use-google-calendar";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  studyTimePreferences: z.array(z.string()).min(1, "Select at least one study time preference"),
  hoursPerWeek: z.string().min(1, "Please select your available hours"),
  learningStyle: z.string().min(1, "Please select your learning style"),
  defaultCalendar: z.string().optional(),
  setReminders: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, userPreferences, refetchUser } = useUser();
  const { connectGoogleCalendar, disconnectGoogleCalendar, isConnected } = useGoogleCalendar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues: Partial<ProfileFormValues> = {
    name: user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    studyTimePreferences: userPreferences?.studyTimePreferences as string[] || [],
    hoursPerWeek: userPreferences?.hoursPerWeek || "10-15 hours",
    learningStyle: userPreferences?.learningStyle || "practical",
    defaultCalendar: userPreferences?.defaultCalendar || "Primary Calendar",
    setReminders: userPreferences?.setReminders ?? true,
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    try {
      await apiRequest('PUT', '/api/user/profile', data);
      await refetchUser();
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleConnectCalendar = async () => {
    try {
      await connectGoogleCalendar();
      toast({
        title: "Google Calendar connected",
        description: "Your Google Calendar has been successfully connected.",
      });
      refetchUser();
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect Google Calendar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectCalendar = async () => {
    try {
      await disconnectGoogleCalendar();
      toast({
        title: "Google Calendar disconnected",
        description: "Your Google Calendar has been disconnected.",
      });
      refetchUser();
    } catch (error) {
      toast({
        title: "Disconnection failed",
        description: "Failed to disconnect Google Calendar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const studyTimeOptions = [
    { id: "morning", label: "Morning" },
    { id: "afternoon", label: "Afternoon" },
    { id: "evening", label: "Evening" },
    { id: "weekend", label: "Weekend" },
  ];

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <Sidebar />
      <MobileNav />
      <div className="md:ml-64 p-6 pb-16 md:pb-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-800">Profile Settings</h1>
          <p className="text-neutral-600">Manage your account preferences and settings</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-6">
              <div className="p-4 border-b border-neutral-200">
                <h2 className="font-medium text-lg text-neutral-800">Personal Information</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center mb-6">
                  <div className="md:w-1/4 mb-2 md:mb-0">
                    <span className="text-sm font-medium text-neutral-700">Profile Picture</span>
                  </div>
                  <div className="md:w-3/4 flex items-center">
                    <img 
                      className="h-16 w-16 rounded-full mr-4" 
                      src={user?.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                      alt="User profile"
                    />
                    <div>
                      <Button variant="outline" size="sm" className="mr-2">Change Photo</Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Remove</Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div></div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+1 (555) 000-0000" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-6">
              <div className="p-4 border-b border-neutral-200">
                <h2 className="font-medium text-lg text-neutral-800">Study Preferences</h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <FormLabel className="block text-sm font-medium text-neutral-700 mb-1">Preferred Study Time</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {studyTimeOptions.map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name="studyTimePreferences"
                        render={({ field }) => {
                          return (
                            <div className="relative">
                              <Checkbox
                                id={option.id}
                                checked={field.value?.includes(option.id)}
                                onCheckedChange={(checked) => {
                                  const updatedPreferences = checked
                                    ? [...field.value, option.id]
                                    : field.value.filter((value) => value !== option.id);
                                  field.onChange(updatedPreferences);
                                }}
                                className="sr-only peer"
                              />
                              <label
                                htmlFor={option.id}
                                className={`flex items-center justify-center bg-white border border-neutral-300 rounded-md px-3 py-2 cursor-pointer text-sm ${
                                  field.value?.includes(option.id)
                                    ? "bg-blue-50 border-primary text-primary"
                                    : "text-neutral-700"
                                }`}
                              >
                                {option.label}
                              </label>
                            </div>
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <FormField
                    control={form.control}
                    name="hoursPerWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average Hours Available Per Week</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select available hours" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Less than 5 hours">Less than 5 hours</SelectItem>
                            <SelectItem value="5-10 hours">5-10 hours</SelectItem>
                            <SelectItem value="10-15 hours">10-15 hours</SelectItem>
                            <SelectItem value="15-20 hours">15-20 hours</SelectItem>
                            <SelectItem value="More than 20 hours">More than 20 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mb-4">
                  <FormLabel className="block text-sm font-medium text-neutral-700 mb-1">Learning Style Preference</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="learningStyle"
                      render={({ field }) => (
                        <div className="space-y-2">
                          <div className="relative">
                            <input
                              type="radio"
                              id="visual"
                              value="visual"
                              checked={field.value === "visual"}
                              onChange={() => field.onChange("visual")}
                              className="sr-only peer"
                            />
                            <label
                              htmlFor="visual"
                              className={`flex items-center justify-center bg-white border border-neutral-300 rounded-md px-3 py-2 cursor-pointer text-sm ${
                                field.value === "visual"
                                  ? "bg-blue-50 border-primary text-primary"
                                  : "text-neutral-700"
                              }`}
                            >
                              Visual (Videos, Diagrams)
                            </label>
                          </div>
                          <div className="relative">
                            <input
                              type="radio"
                              id="reading"
                              value="reading"
                              checked={field.value === "reading"}
                              onChange={() => field.onChange("reading")}
                              className="sr-only peer"
                            />
                            <label
                              htmlFor="reading"
                              className={`flex items-center justify-center bg-white border border-neutral-300 rounded-md px-3 py-2 cursor-pointer text-sm ${
                                field.value === "reading"
                                  ? "bg-blue-50 border-primary text-primary"
                                  : "text-neutral-700"
                              }`}
                            >
                              Reading/Writing (Books, Notes)
                            </label>
                          </div>
                          <div className="relative">
                            <input
                              type="radio"
                              id="practical"
                              value="practical"
                              checked={field.value === "practical"}
                              onChange={() => field.onChange("practical")}
                              className="sr-only peer"
                            />
                            <label
                              htmlFor="practical"
                              className={`flex items-center justify-center bg-white border border-neutral-300 rounded-md px-3 py-2 cursor-pointer text-sm ${
                                field.value === "practical"
                                  ? "bg-blue-50 border-primary text-primary"
                                  : "text-neutral-700"
                              }`}
                            >
                              Practical (Hands-on Projects)
                            </label>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-6">
              <div className="p-4 border-b border-neutral-200">
                <h2 className="font-medium text-lg text-neutral-800">Calendar Integration</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 bg-white border border-neutral-300 rounded flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 3h-1V2c0-.55-.45-1-1-1s-1 .45-1 1v1H7V2c0-.55-.45-1-1-1s-1 .45-1 1v1H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 18H5c-.55 0-1-.45-1-1V8h16v12c0 .55-.45 1-1 1z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Google Calendar</p>
                    {userPreferences?.calendarConnected ? (
                      <p className="text-xs text-green-600">Connected • {userPreferences.calendarEmail}</p>
                    ) : (
                      <p className="text-xs text-neutral-500">Not connected</p>
                    )}
                  </div>
                  <div className="ml-auto">
                    {userPreferences?.calendarConnected ? (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={handleDisconnectCalendar}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleConnectCalendar}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
                
                {userPreferences?.calendarConnected && (
                  <>
                    <div className="mb-4">
                      <FormField
                        control={form.control}
                        name="defaultCalendar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Calendar</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select default calendar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Primary Calendar">Primary Calendar</SelectItem>
                                <SelectItem value="Work">Work</SelectItem>
                                <SelectItem value="Education">Education</SelectItem>
                                <SelectItem value="Personal">Personal</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <FormField
                        control={form.control}
                        name="setReminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Set reminder for study sessions (30 minutes before)
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
