import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { XCircle } from "lucide-react";
import {Card} from "@/components/ui/card"

const ProductInfo = () => {
  const { getAccessToken } = useAuth();
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      const token = await getAccessToken();
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/zap-store/products/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const fetchedProduct = res.data.product;
        setProduct(fetchedProduct);
        setForm(fetchedProduct);
        setImagePreview(fetchedProduct.imageUrl || null);

        if (fetchedProduct.imageGallery && Array.isArray(fetchedProduct.imageGallery)) {
          setGalleryPreviews(fetchedProduct.imageGallery.map(img => img.url));
          setGalleryFiles([]);
        } else {
            setGalleryPreviews([]);
            setGalleryFiles([]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product info");
      }
    };

    fetchProduct();
  }, [productId, getAccessToken]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setForm((prev) => ({ ...prev, image: file }));
      if (file) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview(product.imageUrl || null);
      }
    } else if (name === "imageGallery") {
      const newFiles = Array.from(files);
      const combinedFiles = [...galleryFiles, ...newFiles];

      if (combinedFiles.length > 3) {
        toast.error(`You can upload a maximum of 3 gallery images. You tried to upload ${combinedFiles.length}.`);
        e.target.value = '';
        return;
      }

      setGalleryFiles(combinedFiles);
      setGalleryPreviews(combinedFiles.map((file) => URL.createObjectURL(file)));

    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveGalleryImage = (indexToRemove) => {
    const updatedGalleryFiles = galleryFiles.filter((_, index) => index !== indexToRemove);
    setGalleryFiles(updatedGalleryFiles);

    const updatedGalleryPreviews = galleryPreviews.filter((_, index) => index !== indexToRemove);
    setGalleryPreviews(updatedGalleryPreviews);
  };

  const handleUpdate = async () => {
    const token = await getAccessToken();
    setLoading(true);

    const formData = new FormData();
    for (const key in form) {
      if (key !== "image" && key !== "imageGallery" && form[key] !== null && form[key] !== undefined) {
        formData.append(key, form[key]);
      }
    }

    if (form.image instanceof File) {
      formData.append("image", form.image);
    }

    galleryFiles.forEach((file) => {
        if (file instanceof File) {
            formData.append("newGalleryFiles", file);
        }
    });

    formData.set("flashSale", form.flashSale ? "true" : "false");

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/zap-store/products/${productId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Product updated successfully!");
      setIsEditing(false);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/zap-store/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedProduct = res.data.product;
      setProduct(updatedProduct);
      setForm(updatedProduct);
      setImagePreview(updatedProduct.imageUrl || null);
      setGalleryPreviews(updatedProduct.imageGallery?.map(img => img.url) || []);
      setGalleryFiles([]);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Update failed: " + (error.response?.data?.error || "An unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  if (!product)
    return <p className="text-center py-10 text-lg">Loading product information...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10  rounded-lg my-8">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h2 className="text-3xl  text-gray-800 dark:text-white">Product Details</h2>
        {isEditing ? (
          <div className="flex gap-3">
            <Button
              onClick={handleUpdate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-md transition duration-300"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setForm(product);
                setImagePreview(product.imageUrl || null);
                setGalleryPreviews(product.imageGallery?.map(img => img.url) || []);
                setGalleryFiles([]);
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold py-2 px-5 rounded-md transition duration-300"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            className="font-semibold py-2 px-5 rounded-md transition duration-300"
          >
            Edit Product
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <strong className="text-gray-700 text-lg dark:text-white">Name:</strong>
            {isEditing ? (
              <Input
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 text-base mt-1 dark:text-white border-2 p-2.5 rounded-md">{product.name}</p>
            )}
          </div>

          <div>
            <strong className="text-gray-700 text-lg dark:text-white">Price:</strong>
            {isEditing ? (
              <Input
                type="number"
                name="price"
                value={form.price || ""}
                onChange={handleChange}
                className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 text-base mt-1 dark:text-white border-2 p-2.5 rounded-md" >₹{product.price}</p>
            )}
          </div>
        </div>

        <div>
          <strong className="text-gray-700 text-lg dark:text-white">Description:</strong>
          {isEditing ? (
            <Textarea
              name="description"
              value={form.description || ""}
              onChange={handleChange}
              rows="4"
              className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <p className="text-gray-900 text-base mt-1 leading-relaxed dark:text-white break-words border-2 p-2.5 rounded-md">
              {product.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <strong className="text-gray-700 text-lg dark:text-white">Category:</strong>
            {isEditing ? (
              <Input
                name="category"
                value={form.category || ""}
                onChange={handleChange}
                className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 text-base mt-1 dark:text-white border-2 p-2.5 rounded-md" >{product.category}</p>
            )}
          </div>

          <div>
            <strong className="text-gray-700 text-lg dark:text-white">Stock:</strong>
            {isEditing ? (
              <Input
                type="number"
                name="stock"
                value={form.stock || ""}
                onChange={handleChange}
                className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 text-base mt-1 dark:text-white border-2 p-2.5 rounded-md">{product.stock}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-white">
          <div>
            <strong className="text-gray-700 text-lg dark:text-white ">Discount (%):</strong>
            {isEditing ? (
              <Input
                type="number"
                name="discountPercentage"
                value={form.discountPercentage || 0}
                onChange={handleChange}
                className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 text-base mt-1 dark:text-white border-2 p-2.5 rounded-md">
                {product.discountPercentage}%
              </p>
            )}
          </div>

          <div>
            <strong className="text-gray-700 text-lg dark:text-white">Flash Sale:</strong>
            {isEditing ? (
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="flashSale"
                  name="flashSale"
                  checked={form.flashSale || false}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, flashSale: e.target.checked }))
                  }
                  className="mr-2 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="flashSale" className="text-gray-900 text-base cursor-pointer dark:text-white">
                  Enable Flash Sale
                </label>
              </div>
            ) : (
              <p className="text-gray-900 text-base mt-1 dark:text-white border-2 p-2.5 rounded-md">
                {product.flashSale ? "Yes" : "No"}
              </p>
            )}
          </div>
        </div>

        {/* Main Image Section */}
        <div>
          <strong className="text-gray-700 text-lg dark:text-white">Main Image:</strong>
          {isEditing ? (
            <div className="mt-2">
              <Input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded-md w-full"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Main Product Preview"
                  className="w-48 h-48 object-contain rounded-md border border-gray-200 mt-4 shadow-sm"
                />
              )}
            </div>
          ) : (
            product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-48 h-48 object-contain rounded-md border border-gray-200 mt-2 shadow-sm"
              />
            )
          )}
        </div>

  
        <div>
          <strong className="text-gray-700 text-lg dark:text-white">Gallery Images (Max 3):</strong>
          {isEditing ? (
            <div className="mt-2">
              <Input
                type="file"
                name="imageGallery"
                accept="image/*"
                multiple
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded-md w-full"
              />
              {galleryPreviews.length > 0 && (
                <div className="flex gap-4 mt-4 flex-wrap">
                  {galleryPreviews.map((image, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={image}
                        alt={`Gallery ${idx}`}
                        className="w-32 h-32 object-cover rounded-md border border-gray-200 shadow-sm"
                      />
                      <XCircle
                        className="absolute top-[-8px] right-[-8px] cursor-pointer text-red-500 bg-white rounded-full hover:text-red-700 transition-colors"
                        size={20}
                        onClick={() => handleRemoveGalleryImage(idx)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            product.imageGallery?.length > 0 && (
              <div className="flex gap-4 mt-2 flex-wrap">
                {product.imageGallery.map((image, idx) => (
                  <img
                    key={idx}
                    src={image.url}
                    alt={`Gallery ${idx}`}
                    className="w-32 h-32 object-cover rounded-md border border-gray-200 shadow-sm"
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;