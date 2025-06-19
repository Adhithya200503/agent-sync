import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const ALLOWED_CATEGORIES = [
  "Home Goods",
  "Personal Care",
  "Merchandise Apparel & Accessories",
  "Electronic Peripherals",
  "Gifts & Novelties",
];

const AddProductDialog = ({ storeId, setProducts, products }) => {
  const [open, setOpen] = useState(false);
  const { getAccessToken } = useAuth();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    discountPercentage: "",
    flashSale: false,
    image: null,
    imageGallery: [],
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      if (name === "imageGallery") {
        if (files.length > 3) {
          toast.error("You can upload a maximum of 3 gallery images.");
          return;
        }
        setForm((prev) => ({ ...prev, imageGallery: [...files] }));
      } else {
        setForm((prev) => ({ ...prev, image: files[0] }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.description ||
      !form.price ||
      !form.category ||
      !form.stock ||
      !form.image
    ) {
      toast.error("All required fields must be filled.");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("stock", form.stock);
    formData.append("discountPercentage", form.discountPercentage || "0");
    formData.append("flashSale", form.flashSale.toString());
    formData.append("image", form.image);
    formData.append("storeId", storeId);

    form.imageGallery.forEach((img) => {
      formData.append("imageGallery", img);
    });

    try {
      setLoading(true);
      const token = await getAccessToken();
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/zap-store/add-product`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Product added!");
      setOpen(false);
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        discountPercentage: "",
        flashSale: false,
        image: null,
        imageGallery: [],
      });

      setProducts([...products, res.data.product]);
    } catch (error) {
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          <div>
            <Label>Name</Label>
            <Input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Price (₹)</Label>
            <Input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {ALLOWED_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Stock</Label>
            <Input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Discount Percentage</Label>
            <Input
              type="number"
              name="discountPercentage"
              value={form.discountPercentage}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
          <div className="flex items-center gap-2 col-span-1 lg:col-span-2">
            <Checkbox
              id="flashSale"
              checked={form.flashSale}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, flashSale: checked }))
              }
            />
            <Label htmlFor="flashSale">Flash Sale</Label>
          </div>
          <div>
            <Label>Product Image</Label>
            <Input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Gallery Images (Max 3)</Label>
            <Input
              type="file"
              name="imageGallery"
              accept="image/*"
              multiple
              onChange={handleChange}
            />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Uploading..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
