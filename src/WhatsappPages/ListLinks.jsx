import React, { useEffect, useState, useMemo } from "react";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { Search, ExternalLink, Eye, Trash2, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SimplifiedLinksTable = ({ onViewLink }) => {
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const linksCollectionRef = collection(db, "links");
        const q = query(
          linksCollectionRef,
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);

        // This line was the missing piece to populate userLinks
        const userLinks = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setData(userLinks); // Now userLinks is defined
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      getData();
    }
  }, [currentUser]);

  const handleView = (link) => {
    navigate(`/whatsapp/link-info/${link.id}`); // redirect to the edit page with the document ID
  };
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this link?")) {
      try {
        await deleteDoc(doc(db, "links", id));
        setData((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    }
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const searchLower = searchTerm.toLowerCase();
    return data.filter((item) => {
      const searchableFields = [item.urlId, item.waUrl, item.phone];
      return searchableFields.some((field) =>
        field?.toString().toLowerCase().includes(searchLower)
      );
    });
  }, [data, searchTerm]);

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    const expiry = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
    return expiry < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl text-gray-900 dark:text-white">
            WhatsApp Links Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track your WhatsApp marketing links
          </p>
        </div>

        {/* Search Bar */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by URL ID, phone, or WhatsApp URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Links
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Search className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Links
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {
                      filteredData.filter((item) => !isExpired(item.expiresAt))
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <ExternalLink className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Expired Links
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {
                      filteredData.filter((item) => isExpired(item.expiresAt))
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Table */}
        <Card className="hidden lg:block bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Links Overview</span>
              <Badge variant="secondary">{filteredData.length} items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      URL ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      WhatsApp URL
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.map((item) => {
                    const expired = isExpired(item.expiresAt);
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4">
                          <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                            {item.urlId}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{item.phone || "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <a
                            href={item.waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline truncate block"
                            title={item.waUrl}
                          >
                            {item.waUrl || "N/A"}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={expired ? "destructive" : "default"}>
                            {expired ? "Expired" : "Active"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleView(item)}
                              className="flex items-center space-x-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredData.map((item) => {
            const expired = isExpired(item.expiresAt);
            return (
              <Card key={item.id} className="bg-white dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                          {item.urlId}
                        </code>
                      </CardTitle>
                      <Badge variant={expired ? "destructive" : "default"}>
                        {expired ? "Expired" : "Active"}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewLink(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone
                      </p>
                      <p className="text-gray-900 dark:text-gray-300">
                        {item.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <ExternalLink className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        WhatsApp URL
                      </p>
                      <a
                        href={item.waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline break-all text-sm"
                      >
                        {item.waUrl || "N/A"}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              {searchTerm ? (
                <p className="text-gray-500 dark:text-gray-400">
                  No links found matching "{searchTerm}"
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No WhatsApp links found. Create your first link to get
                  started.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SimplifiedLinksTable;
