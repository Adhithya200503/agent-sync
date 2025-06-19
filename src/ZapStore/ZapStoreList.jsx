import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Settings, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
const ZapStoreList = ({ zapStores, setZapStores }) => {
  const { getAccessToken, currentUser } = useAuth();

  useEffect(() => {
    async function getUserZapStores() {
      const token = await getAccessToken();
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/zap-store/user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setZapStores(res.data.stores);
      } catch (error) {
        toast.error(error.details);
      }
    }

    getUserZapStores();
  }, [currentUser]);

  const navigate = useNavigate();

  const handleStoreDelete = async (storeId) => {
    const token = await getAccessToken();
    try {
      const res = await axios.delete(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/zap-store/stores/delete/${storeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message);
      setZapStores((prev) => prev.filter((store) => store.storeId !== storeId));
    } catch (error) {
      toast.error("error in deleting the zap store");
    }
  };
  console.log(zapStores);

  const handleManageNavigate = (storeId) => {
    navigate(`/zap-store/stores/${storeId}`);
  };
  const handleEditZapStore = (storeId) => {
    navigate(`/zap-store/edit-zap-store/${storeId}`);
  };
  return (
    <div>
      {zapStores.map((store, index) => {
        return (
          <Card
            key={index}
            className="w-full lg:max-w-2xl mb-6 flex flex-col lg:flex-row overflow-hidden border border-muted/40 transition-all duration-300 mt-2"
          >
            <div className="w-full lg:w-[220px] bg-muted/10 flex  justify-center p-6">
              <img
                src={store.storeImageUrl}
                alt={store.storeName}
                className="w-[150px] h-[150px] rounded-full object-cover shadow-md border-2 border-muted"
              />
            </div>

            <div className="flex flex-col justify-between w-full lg:w-[calc(100%-220px)] px-6 py-4">
              <div>
                <CardHeader className="px-0 pb-2">
                  <CardTitle className="text-2xl font-semibold text-primary">
                    {store.storeName}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {store.category}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-0 py-2">
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {store.bio}
                  </p>
                </CardContent>
              </div>

              <CardFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4  items-stretch sm:items-center px-0 pt-4">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto shadow-sm hover:shadow-md"
                  onClick={() => handleManageNavigate(store.storeId)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Button>

                <Button
                  variant="secondary"
                  className="w-full sm:w-auto shadow-sm hover:shadow-md"
                  onClick={()=>handleEditZapStore(store.storeId)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  className="w-full sm:w-auto shadow-sm hover:shadow-md"
                  onClick={() => handleStoreDelete(store.storeId)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ZapStoreList;
