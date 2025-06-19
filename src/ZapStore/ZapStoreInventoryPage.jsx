import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader, Plus } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

import AddProductDialog from "./AddProductDialog";
import ProductCard from "./ProductCard";

const ZapStoreInventoryPage = () => {
  const params = useParams();
  const storeId = params.storeId;
  const { getAccessToken } = useAuth();
  const [zapStoreInfo, setZapStoreInfo] = useState({
    storeName: "",
    bio: "",
    category: "",
  });
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const { currentUser } = useAuth();
  useEffect(() => {
    async function getUserStoreDetail() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/zap-store/stores/${storeId}`
        );
        setZapStoreInfo(res.data.store);
      } catch (error) {
        toast.error("unable to fetch store info");
        console.log("error", error.res.details);
      }
    }
    getUserStoreDetail();
  }, [currentUser]);

  useEffect(() => {
    async function productsOfZapStore() {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/zap-store/store/products/${storeId}`
        );
        setProducts(res.data.products);
      } catch (error) {
        toast.error("unable to fetch products");
      }
    }
    productsOfZapStore();
  }, [currentUser, zapStoreInfo]);

  const handleDeleteProduct = async (productId) => {
    console.log(productId)
    const token = await getAccessToken();
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/zap-store/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("product deleted successfully");

      setProducts((prev) =>
        prev.filter((product) => product.productId !== productId)
      );
    } catch (error) {
      toast.error("error in deleting the product");
    }
  };

  const handleEditProduct = (productId)=>{
    navigate(`/zap-store/products/${productId}`)
  }
  console.log(products)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
      <div className="inventory-info">
        <Card className="max-w-xl">
          <CardHeader className="flex justify-between">
            <span>Zap store info</span>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label>Store Name</Label>
              <Input
                value={zapStoreInfo.storeName}
                disabled
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Bio</Label>
              <Input value={zapStoreInfo.bio} disabled className="w-full" />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Category</Label>
              <Input
                value={zapStoreInfo.category}
                disabled
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <span>Product Info</span>
          </CardHeader>
          <CardContent>
            <span>total products {products.length}</span>
          </CardContent>
        </Card>
      </div>
      <div className="zap-store-product-container lg:col-span-2">
        <Card className="shadow-none border-none">
          <CardHeader className="flex justify-between">
            <span className="text-xl">Products</span>
            <AddProductDialog
              storeId={storeId}
              setProducts={setProducts}
              products={products}
            />
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              "No products found"
            ) : (
              <ScrollArea className="w-full h-[40vh] pr-2">
                <div className="flex flex-col gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.productId}
                      product={product}
                      handleDeleteProduct={handleDeleteProduct}
                      handleEditProduct={handleEditProduct}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ZapStoreInventoryPage;
