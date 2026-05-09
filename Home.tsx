import React, { useState, useEffect, useMemo } from "react";
import { collection, query, orderBy, onSnapshot, limit, doc, updateDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Job } from "../types";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Home() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    // 1. Fetch latest jobs (e.g., limit to 200 for client-side filtering)
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(200));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedJobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      setJobs(fetchedJobs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "jobs");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = job.location.toLowerCase().includes(locationFilter.toLowerCase());
      return matchesSearch && matchesLocation;
    });
  }, [jobs, searchTerm, locationFilter]);

  return (
    <div className="w-full flex-1 flex flex-col overflow-hidden">
      {/* Hero / Search Section */}
      <div className="bg-white px-4 sm:px-8 py-8 shrink-0 border-b border-slate-100">
        <div className="max-w-4xl mx-auto lg:mx-0">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">
            Find Help. Earn Money. Support Each Other.
          </h1>
          <p className="text-slate-500 text-lg mb-6">
            A simple platform connecting local vendors with students ready to work.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input 
                type="text"
                placeholder="Search for tasks like 'delivery' or 'moving'..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
              />
            </div>
            <input 
              placeholder="All Locations" 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 focus:outline-none transition-all"
            />
            <button className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="flex flex-col lg:flex-row flex-1 p-4 sm:p-8 gap-8 max-w-7xl mx-auto w-full overflow-hidden">
        
        {/* Job Feed (Left) */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 pb-8">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Latest Opportunities
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-medium text-slate-500">
                {filteredJobs.length} active tasks
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
               <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-slate-200">
                 <div className="animate-pulse flex flex-col items-center">
                   <div className="h-8 w-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4"></div>
                   <p className="text-slate-500 font-medium">Loading tasks...</p>
                 </div>
               </div>
            ) : filteredJobs.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                 <p className="text-slate-500 font-medium text-lg">No tasks found matching your criteria.</p>
                 <p className="text-slate-400 mt-2">Try adjusting your search or check back later.</p>
               </div>
            ) : (
              filteredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))
            )}
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 lg:overflow-y-auto pb-8">
          {/* Post Job Card */}
          <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl shadow-indigo-200">
            <h3 className="text-xl font-bold mb-1">Need Help?</h3>
            <p className="text-slate-400 text-sm mb-6">Post a task in seconds and get it done today.</p>
            <Link to="/post" className="block w-full text-center py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
              Post Task Now
            </Link>
          </div>

          {/* Stats / Community */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-200"></div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300"></div>
              </div>
              <span className="text-xs font-bold text-slate-700">+124 active students</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Tasks published</span>
                <span className="text-sm font-bold text-slate-900">{jobs.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Earned today</span>
                <span className="text-sm font-bold text-emerald-600">
                  ₹{jobs.filter(j => j.status === 'completed' && j.acceptedBy === user?.uid).reduce((acc, curr) => {
                    // Try to extract number from payment string like "₹500" or "500/hr"
                    const match = curr.payment.match(/\d+/);
                    return acc + (match ? parseInt(match[0], 10) : 0);
                  }, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

const JobCard: React.FC<{ job: Job }> = ({ job }) => {
  const { user } = useAuth();
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAcceptTask = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please log in to accept tasks.");
      return;
    }

    if (job.userId === user.uid) {
      alert("You cannot accept your own task.");
      return;
    }

    try {
      setIsAccepting(true);
      const jobRef = doc(db, "jobs", job.id);
      await updateDoc(jobRef, {
        status: "accepted",
        acceptedBy: user.uid
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "jobs");
      setIsAccepting(false);
    }
  };

  const isAccepted = job.status === "accepted" || job.status === "completed";
  const isAcceptedByMe = job.acceptedBy === user?.uid;
  const isOwner = job.userId === user?.uid;

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group cursor-pointer">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase">
              Task
            </span>
            <span className="text-xs text-slate-400">
              {formatDistanceToNow(job.createdAt, { addSuffix: true })} ago
            </span>
            {isAccepted && (
               <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded uppercase ml-2">
                 {job.status === "completed" ? "Completed" : "Accepted"}
               </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {job.title}
          </h3>
          <p className="text-slate-500 text-sm mt-1 line-clamp-2">{job.description}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center">
                <div className="w-2 h-2 border-b border-r border-slate-400 rotate-45 mb-1"></div>
              </div>
              <span className="text-xs font-medium text-slate-600">{job.location}</span>
            </div>
            {(isOwner || isAcceptedByMe) && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-600">Contact: {job.contactInfo}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end mt-2 sm:mt-0 h-full shrink-0">
          <div className="text-xl font-black text-indigo-600">{job.payment}</div>
          
          {isAccepted ? (
            isAcceptedByMe ? (
              <div className="flex flex-col gap-2 items-end mt-0 sm:mt-4">
                <span className="text-sm font-bold text-emerald-600">You Accepted</span>
                <a href={`tel:${job.contactInfo}`} className="px-4 py-1.5 border border-emerald-200 bg-emerald-50 rounded-full text-xs font-bold text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all inline-block" onClick={(e) => e.stopPropagation()}>Call Client</a>
              </div>
            ) : isOwner ? (
                <div className="mt-0 sm:mt-4 px-4 py-1.5 border border-slate-200 bg-slate-50 rounded-full text-xs font-bold text-slate-500">
                  Accepted by Helper
                </div>
            ) : (
              <div className="mt-0 sm:mt-4 px-4 py-1.5 border border-slate-200 bg-slate-100 rounded-full text-xs font-bold text-slate-400 cursor-not-allowed">
                Already Accepted
              </div>
            )
          ) : (
            <button 
              onClick={handleAcceptTask}
              disabled={isAccepting || isOwner}
              className="mt-0 sm:mt-4 px-4 py-1.5 border border-slate-200 rounded-full text-xs font-bold text-slate-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all inline-block disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAccepting ? "Accepting..." : (isOwner ? "Your Task" : "Accept Task")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
