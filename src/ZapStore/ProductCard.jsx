import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProductCard = ({ product, handleDeleteProduct, handleEditProduct }) => {
  return (
    <Card className="w-full  max-w-4xl flex flex-col lg:flex-row gap-4 shadow-lg hover:shadow-xl transition mb-4">
      <div className="lg:w-1/3 w-full rounded-md">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-30 lg:h-50 object-cover px-4 rounded-xl "
        />
      </div>

      {/* Info Section */}
      <div className="flex flex-col justify-between flex-1">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {product.name}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {product.category}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <p className="text-sm text-gray-700 ">
            {product.description.length > 50
              ? product.description.slice(0, 50) + "..."
              : product.description}
          </p>
          <p className="text-lg font-bold text-green-600">₹ {product.price}</p>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              handleEditProduct(product.productId);
            }}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDeleteProduct(product.productId)}
          >
            Delete
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default ProductCard;
