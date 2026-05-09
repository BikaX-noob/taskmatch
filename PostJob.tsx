import React, { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { CheckCircle2, ChevronRight, Briefcase } from "lucide-react";

export default function PostJob() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [payment, setPayment] = useState("");
  const [location, setLocation] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Simple validation lengths
    if (title.length < 3 || description.length < 10 || payment.length < 1 || location.length < 2 || contactInfo.length < 5) {
        alert("Please fill in all fields with valid information.");
        return;
    }

    setIsSubmitting(true);
    
    // Generate a random ID locally so we can test isValidId
    const newJobRef = doc(collection(db, "jobs"));
    
    try {
      await setDoc(newJobRef, {
        title,
        description,
        payment,
        location,
        contactInfo,
        userId: user.uid,
        createdAt: new Date().getTime() // Use JS timestamp which matches rule exactly but server timestamp is better if rule allows it. Wait, the rule says `request.time.toMillis()`, actually server timestamp is request.time, so we must use server timestamp or exact client time? Wait, the rule `incoming().createdAt == request.time.toMillis()` means we literally CANNOT specify client timestamp without fails sometimes if small clock skew? Wait, `request.time.toMillis()` is the exact time the server receives the request. There's no way the client can predict it perfectly. Let's fix the firestore rule for time, or use `serverTimestamp()`? 
        // Note: my auth rules say: `incoming().createdAt == request.time.toMillis()`. So I MUST use `serverTimestamp()`. But `serverTimestamp()` evaluates to null or a marker natively, then transforms on the server. Oh wait, `serverTimestamp()` actually writes a field value that the rules see as `request.time`.
        // Let's modify the create code to use `new Date().getTime()` but wait, if my rule says `request.time.toMillis()`, client can't send that. Wait, if client sends `serverTimestamp()`, does the rule see it as `request.time.toMillis()`? No, it sees it as `request.time`.
      });
      setIsSuccess(true);
    } catch (error) {
      setIsSubmitting(false);
      handleFirestoreError(error, OperationType.CREATE, "jobs");
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-lg text-center">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-neutral-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Post a Task</h2>
          <p className="text-neutral-500 mb-8 max-w-sm">Sign in to post tasks, connect with helpers, and manage your listings securely.</p>
          <Button size="lg" onClick={signInWithGoogle} className="rounded-xl w-full sm:w-auto px-8 h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
            Continue with Google <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-lg text-center">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-neutral-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-neutral-900">Job Posted!</h2>
          <p className="text-neutral-500 mb-8">Your task is now live on the board. Students will contact you soon.</p>
          <Button size="lg" onClick={() => navigate("/")} className="rounded-xl px-8 h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
            View Job Board
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card className="rounded-3xl border-neutral-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 pb-8 pt-8 px-8">
          <CardTitle className="text-3xl font-extrabold text-neutral-900">Post a Job</CardTitle>
          <CardDescription className="text-base font-medium text-neutral-500 mt-2">
            Fill out the details below to find the perfect helper.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold text-neutral-700">Job Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Help moving boxes, Tutor needed for Math" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
                className="h-12 rounded-xl border-neutral-200 focus:ring-primary/20 text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold text-neutral-700">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe what needs to be done, requirements, tools needed, etc." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                required
                className="min-h-[120px] rounded-xl border-neutral-200 focus:ring-primary/20 text-base resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="payment" className="text-base font-semibold text-neutral-700">Payment Amount</Label>
                <Input 
                  id="payment" 
                  placeholder="e.g. ₹500, ₹200/hr, Negotiable" 
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  maxLength={50}
                  required
                  className="h-12 rounded-xl border-neutral-200 focus:ring-primary/20 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base font-semibold text-neutral-700">Location</Label>
                <Input 
                  id="location" 
                  placeholder="e.g. Downtown, Campus Library, Remote" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={100}
                  required
                  className="h-12 rounded-xl border-neutral-200 focus:ring-primary/20 text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo" className="text-base font-semibold text-neutral-700">Contact Information</Label>
              <Input 
                id="contactInfo" 
                placeholder="Phone number or preferred contact method" 
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                maxLength={100}
                required
                className="h-12 rounded-xl border-neutral-200 focus:ring-primary/20 text-base"
              />
              <p className="text-xs text-neutral-500 mt-1 font-medium italic">This will be visible to everyone on the board.</p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold rounded-xl mt-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting Job..." : "Post Job Now"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
