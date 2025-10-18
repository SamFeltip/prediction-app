"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";
import { markets } from "@lib/schema";
import { InferSelectModel } from "drizzle-orm";
import { DeleteMarketButton } from "./delete-market-button";

type MarketEditProps = InferSelectModel<typeof markets>;

export function EditMarket({ market }: { market: MarketEditProps }) {
  const [title, setTitle] = useState(market.title);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(market.description);
  const router = useRouter();

  const handleUpdate = async () => {
    setLoading(true);
    const res = await fetch(`/api/markets/${market.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (res.ok) {
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/markets/${market.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Wager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        {
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={undefined}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        }
        <div className="flex justify-end space-x-2">
          <DeleteMarketButton title={title} onDelete={handleDelete} />
          <Button onClick={handleUpdate} disabled={loading}>
            Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
