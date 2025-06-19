import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Copy, Share2, Save, Loader } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const ZappyPost = () => {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("");

  const [tone, setTone] = useState("default-tone");
  const [callToAction, setCallToAction] = useState("default-cta");
  const [emojiStyle, setEmojiStyle] = useState("default-emoji");
  const [brevityLevel, setBrevityLevel] = useState("default-brevity");

  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getAccessToken } = useAuth();

  const handleChange = (e) => {
    setUrl(e.target.value);
  };

  const renderPostText = (post) => {
    if (!post || !post.content) return null;

    const text = post.content;
    const hashtags = post.hashtags || [];

    const clean = text
      .replace(/\*\*(.*?)\*\*/g, "$1") // remove **bold**
      .replace(/\[\.\.\.\]/g, "") // remove placeholders
      .replace(/#+\s?/g, "") // remove stray # (though backend should handle this now)
      .trim();

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return (
      <>
        {clean.split("\n").map((line, index) => (
          <p key={`line-${index}`} className="mb-2">
            {line.split(urlRegex).map((part, i) =>
              urlRegex.test(part) ? (
                <a
                  key={`link-${i}`}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {part}
                </a>
              ) : (
                part
              )
            )}
          </p>
        ))}
        {hashtags.length > 0 && (
          <p className="mt-2 text-sm text-gray-700 font-semibold">
            Hashtags: <span className="font-normal">{hashtags.join(" ")}</span>
          </p>
        )}
      </>
    );
  };

  const generatePost = async () => {
    setLoading(true);
    setGeneratedContent(null);
    const token = await getAccessToken();

    // Process select values before sending to backend
    const selectedTone = tone === "default-tone" ? undefined : tone;
    const selectedEmojiStyle =
      emojiStyle === "default-emoji" ? undefined : emojiStyle;
    const selectedBrevityLevel =
      brevityLevel === "default-brevity" ? undefined : brevityLevel;

    let finalCallToAction;
    if (callToAction === "default-cta") {
      finalCallToAction = undefined;
    } else if (callToAction === "ai-generate-cta") {
      finalCallToAction = true;
    } else {
      finalCallToAction = callToAction;
    }

    try {
      const res = await axios.post(
        "https://agentsync.onrender.com/ai/generate-post", // Your backend URL
        {
          url,
          socialMediaPlatform: platform,
          tone: selectedTone,
          callToAction: finalCallToAction,
          emojiStyle: selectedEmojiStyle,
          brevityLevel: selectedBrevityLevel,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const {
        title,
        description,
        image,
        posts,
        suggestedPostTime,
        detectedContentSentiment,
      } = res.data;
      setGeneratedContent({
        title,
        description,
        image,
        posts,
        suggestedPostTime,
        detectedContentSentiment,
      });
      toast.success("Posts generated successfully!");
    } catch (error) {
      console.error("Error generating post:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to generate post. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    toast.success("Copied to clipboard!");
  };

  const handleShare = (textToShare) => {
    if (navigator.share) {
      navigator
        .share({
          title: "ZappyPost",
          text: textToShare,
        })
        .then(() => toast.success("Shared successfully!"))
        .catch(() => toast.error("Sharing failed."));
    } else {
      toast.error("Sharing not supported on this device.");
    }
  };

  const handleSave = (textToSave, index) => {
    const element = document.createElement("a");
    const file = new Blob([textToSave], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = `zappypost_post_${index + 1}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Saved to file!");
  };

  return (
    <div className="p-4">
      <p className="text-3xl font-bold mb-8 text-center">ZappyPost</p>
      <div className="w-full max-w-md mx-auto input-container flex flex-col gap-4">
        <Input
          className="w-full"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => handleChange(e)}
        />
        <Select onValueChange={setPlatform} value={platform}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Platform" />
          </SelectTrigger>
          <SelectContent>
            {/* Platform selection is required, so no "empty" item here */}
            <SelectItem value="Instagram">Instagram</SelectItem>
            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
            <SelectItem value="Youtube">Youtube</SelectItem>
            <SelectItem value="Facebook">Facebook</SelectItem>
          </SelectContent>
        </Select>

        {/* New Feature Selects with corrected value props for default items */}
        <Select onValueChange={setTone} value={tone}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Tone (Optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default-tone">
              Default (Auto-detected)
            </SelectItem>{" "}
            {/* Changed value from "" to "default-tone" */}
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="humorous">Humorous</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="inspirational">Inspirational</SelectItem>
            <SelectItem value="informative">Informative</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setEmojiStyle} value={emojiStyle}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Emoji Style (Optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default-emoji">Default</SelectItem>{" "}
            {/* Changed value from "" to "default-emoji" */}
            <SelectItem value="none">No Emojis</SelectItem>
            <SelectItem value="light">Light Emojis</SelectItem>
            <SelectItem value="moderate">Moderate Emojis</SelectItem>
            <SelectItem value="heavy">Heavy Emojis</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setCallToAction} value={callToAction}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Common CTA (Optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default-cta">No Specific CTA</SelectItem>{" "}
            {/* Changed value from "" to "default-cta" */}
            <SelectItem value="ai-generate-cta">
              AI Generate CTA
            </SelectItem>{" "}
            {/* Changed value from "true" to "ai-generate-cta" */}
            <SelectItem value="Visit our website">Visit our website</SelectItem>
            <SelectItem value="Shop now">Shop now</SelectItem>
            <SelectItem value="Read the full article">
              Read the full article
            </SelectItem>
            <SelectItem value="Watch the video">Watch the video</SelectItem>
            <SelectItem value="Sign up today">Sign up today</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setBrevityLevel} value={brevityLevel}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Brevity Level (Optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default-brevity">Standard</SelectItem>{" "}
            {/* Changed value from "" to "default-brevity" */}
            <SelectItem value="concise">Very Concise</SelectItem>
            <SelectItem value="expanded">Expanded</SelectItem>
          </SelectContent>
        </Select>

        <Button
          className="mt-2 w-full"
          onClick={generatePost}
          disabled={loading || !url || !platform}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              <span>Generating posts...</span>
            </span>
          ) : (
            "Generate Posts"
          )}
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center items-center mt-8 text-lg text-gray-600">
          Generating posts...
        </div>
      )}

      {generatedContent && (
        <ScrollArea className="mt-8 h-[70vh] max-w-2xl lg:max-w-4xl mx-auto border rounded-lg p-4 bg-white shadow-md">
          {generatedContent.image && (
            <div className="mb-6 text-center">
              <img
                src={generatedContent.image}
                alt="Preview"
                className="max-w-xs max-h-48 object-contain rounded-lg shadow-md mx-auto"
              />
              {generatedContent.title && (
                <h3 className="text-xl font-semibold mt-4">
                  {generatedContent.title}
                </h3>
              )}
              {generatedContent.description && (
                <p className="text-muted-foreground text-sm mt-2">
                  {generatedContent.description}
                </p>
              )}
              {generatedContent.detectedContentSentiment && (
                <p className="text-sm text-gray-500 mt-2">
                  Detected Sentiment:{" "}
                  <span className="font-medium capitalize">
                    {generatedContent.detectedContentSentiment}
                  </span>
                </p>
              )}
            </div>
          )}

          <h2 className="text-2xl font-bold mb-4 text-center border-b pb-2">
            Generated Social Media Posts
          </h2>
          {generatedContent.posts && generatedContent.posts.length > 0 ? (
            generatedContent.posts.map((post, index) => (
              <div
                key={index}
                className="mb-8 p-4 border rounded-md bg-gray-50"
              >
                <p className="text-lg font-medium mb-3">Post #{index + 1}</p>
                <div className="prose max-w-none">{renderPostText(post)}</div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleCopy(
                        post.content +
                          (post.hashtags ? "\n" + post.hashtags.join(" ") : "")
                      )
                    }
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleShare(
                        post.content +
                          (post.hashtags ? "\n" + post.hashtags.join(" ") : "")
                      )
                    }
                  >
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleSave(
                        post.content +
                          (post.hashtags ? "\n" + post.hashtags.join(" ") : ""),
                        index
                      )
                    }
                  >
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No posts were generated. Try a different URL or platform.
            </p>
          )}

          {generatedContent.suggestedPostTime && (
            <div className="mt-8 p-4 border rounded-md bg-blue-50 text-blue-800">
              <h3 className="font-semibold text-lg mb-2">
                💡 Optimal Posting Time Tip:
              </h3>
              <p>{generatedContent.suggestedPostTime}</p>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default ZappyPost;
