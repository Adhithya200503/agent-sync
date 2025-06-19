import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


import { getFirestore, collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../context/AuthContext';


const Loader = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4.75V6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.1266 6.87347L16.0659 7.93413" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.25 12L17.75 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.1266 17.1265L16.0659 16.0659" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 17.75V19.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.93413 16.0659L6.87347 17.1266" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.25 12L4.75 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.93413 7.93413L6.87347 6.87347" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


const ListPortfolios = () => {
  const navigate = useNavigate();
  const {currentUser} = useAuth();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState(null);


  

  // 2. Fetch Portfolios from Firestore (Real-time updates)
  useEffect(() => {
 
    try {
      const q = query(collection(db, "portfolios"), where("userId", "==", currentUser.uid));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedPortfolios = [];
        snapshot.forEach((doc) => {
          fetchedPortfolios.push({ id: doc.id, ...doc.data() });
        });
        setPortfolios(fetchedPortfolios);
        setLoading(false);
        console.log("Portfolios fetched:", fetchedPortfolios);
      }, (err) => {
        console.error("Error fetching portfolios:", err);
        setError("Failed to load portfolios.");
        toast.error("Failed to load portfolios: " + err.message);
        setLoading(false);
      });

      
      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up Firestore snapshot listener:", err);
      setError("Failed to set up real-time listener.");
      toast.error("Error with real-time updates: " + err.message);
      setLoading(false);
    }
  }, [currentUser]);

  const handleDeleteClick = (portfolioId) => {
    setPortfolioToDelete(portfolioId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!portfolioToDelete || !db) return;

    setDeleteConfirmOpen(false); // Close dialog immediately
    toast.loading("Deleting portfolio...", { id: "delete-toast" });

    try {
      await deleteDoc(doc(db, "portfolios", portfolioToDelete));
      toast.success("Portfolio deleted successfully!", { id: "delete-toast" });
      setPortfolioToDelete(null); // Clear the ID
    } catch (err) {
      console.error("Error deleting portfolio:", err);
      toast.error("Failed to delete portfolio: " + err.message, { id: "delete-toast" });
    }
  };

  const handleEditClick = (id) => {
    navigate(`/bio-gram/portfolio/edit/${id}`); // Navigate to the edit page
  };

  const handleAnalyticsClick = (id) => {
    toast.info(`Analytics for portfolio ${id} (Coming soon!)`);
    // Implement actual analytics logic here later
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <Loader className="h-10 w-10 animate-spin text-blue-500" />
        <p className="ml-3 text-lg text-gray-700 dark:text-gray-300">Loading your portfolios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900 text-red-500 dark:text-red-400">
        <p className="text-lg">Error: {error}</p>
        <Button onClick={() => window.location.reload()} className="ml-4">
          Retry
        </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl text-center text-gray-900 dark:text-white mb-10">Your Portfolios</h1>

      <Card className="mb-8 p-6 shadow-none text-center transition-all duration-300 ease-in-out bg-transparent border-none">
        <CardHeader>
          <CardTitle className="text-2xl text-black dark:text-white">Start Something New!</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Don't have a portfolio yet, or want to create another one? Click below!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => navigate('/bio-gram/create-portfolio')}
            className="w-full md:w-auto px-8 py-3  bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create New Portfolio
          </Button>
        </CardContent>
      </Card>

      <Separator className="my-10" />

      {/* List Existing Portfolios */}
      {portfolios.length === 0 ? (
        <Card className="text-center p-8">
          <CardTitle className="text-xl">No Portfolios Found</CardTitle>
          <CardDescription className="mt-2">
            It looks like you haven't created any portfolios yet. Get started by clicking the button above!
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1  lg:grid-cols-2 gap-6">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <Avatar className="h-16 w-16 border-2 border-indigo-400">
                  <AvatarImage src={portfolio.profileImg} alt={portfolio.name} />
                  <AvatarFallback>{portfolio.name ? portfolio.name.charAt(0) : "P"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl truncate">{portfolio.name || 'Unnamed Portfolio'}</CardTitle>
                  <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                    {portfolio.profession || 'Unknown Profession'} - {portfolio.domain || 'General'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow pt-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-3">{portfolio.description || 'No description provided.'}</p>
                <div className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
                  <p><strong>Name:</strong> {portfolio.name || 'N/A'}</p>
                  <p><strong>Portfolio Id:</strong> {portfolio.id || 'N/A'}</p>
                  <p><strong>Phone:</strong> {portfolio.phoneNumber || 'N/A'}</p>
                  <p><strong>Email:</strong> {portfolio.email || 'N/A'}</p>
                  <p><strong>url:</strong> {<a className="hover:text-blue-700 hover:underline" href={portfolio.url}>{portfolio.url}</a> || 'N/A'}</p>
                </div>
              </CardContent>
              <div className="p-6 pt-0 flex justify-between items-center gap-2 flex-wrap">
                <Button variant="outline" onClick={() => handleEditClick(portfolio.id)} className="flex-1 min-w-[80px]">Edit</Button>
                <Button variant="outline" onClick={() => handleAnalyticsClick(portfolio.id)} className="flex-1 min-w-[80px]">Analytics</Button>
                <Button variant="destructive" onClick={() => handleDeleteClick(portfolio.id)} className="flex-1 min-w-[80px]">Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your portfolio.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListPortfolios;
