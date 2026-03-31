import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import {
  CheckCircle2,
  Download,
  DownloadCloud,
  Loader2,
  RefreshCw,
  Shirt,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

const ALL_CATEGORIES = [
  { id: "animals", label: "Animals & Wildlife", emoji: "🦁" },
  { id: "space", label: "Space & Galaxy", emoji: "🚀" },
  { id: "abstract", label: "Abstract Art", emoji: "🎨" },
  { id: "nature", label: "Nature & Botanical", emoji: "🌿" },
  { id: "geometric", label: "Geometric Patterns", emoji: "🔷" },
  { id: "vintage", label: "Vintage & Retro", emoji: "📼" },
  { id: "skulls", label: "Skulls & Dark Art", emoji: "💀" },
  { id: "mandala", label: "Mandala & Spiritual", emoji: "🕉️" },
  { id: "ocean", label: "Ocean & Marine", emoji: "🌊" },
  { id: "fantasy", label: "Fantasy & Dragons", emoji: "🐉" },
  { id: "music", label: "Music & Instruments", emoji: "🎸" },
  { id: "sports", label: "Sports & Adventure", emoji: "⚡" },
  { id: "food", label: "Food & Drinks", emoji: "🍕" },
  { id: "flowers", label: "Flowers & Floral", emoji: "🌸" },
  { id: "funny", label: "Funny & Cartoon", emoji: "😂" },
];

const PAGE_SIZE = 20;

type ImageSize = "512" | "768" | "1024";
type Quantity = "10" | "50" | "100";

interface GeneratedImage {
  id: string;
  categoryId: string;
  categoryLabel: string;
  number: number;
  seed: number;
  url: string;
}

function buildPromptUrl(
  category: string,
  seed: number,
  size: ImageSize,
): string {
  const prompt = encodeURIComponent(
    `${category} t-shirt print design, vector illustration, transparent background, no text, high contrast, bold colors, printable art`,
  );
  const dim = size === "1024" ? 1024 : size === "768" ? 768 : 512;
  return `https://image.pollinations.ai/prompt/${prompt}?width=${dim}&height=${dim}&seed=${seed}&nologo=true&model=flux`;
}

async function downloadImageAsBlob(url: string): Promise<Blob | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    return await resp.blob();
  } catch {
    return null;
  }
}

function ImageCard({
  img,
  idx,
  onRegenerate,
}: {
  img: GeneratedImage;
  idx: number;
  onRegenerate: (id: string) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await downloadImageAsBlob(img.url);
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `${img.categoryLabel.replace(/\s+/g, "-").toLowerCase()}-design-${img.number}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        toast.success("Image downloaded!");
      } else {
        window.open(img.url, "_blank");
        toast.info("Opened in new tab -- right-click to save.");
      }
    } catch {
      window.open(img.url, "_blank");
      toast.info("Opened in new tab -- right-click to save.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="card-dark rounded-xl overflow-hidden"
      data-ocid={`designs.item.${idx + 1}`}
    >
      <div
        className="relative aspect-square overflow-hidden"
        style={{ background: "oklch(0.22 0.012 240)" }}
      >
        {!loaded && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-accent" />
            <span className="text-[10px] text-muted-foreground">
              Loading...
            </span>
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2">
            <X className="w-6 h-6 text-destructive" />
            <span className="text-[10px] text-muted-foreground text-center">
              Failed
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRegenerate(img.id)}
              className="h-6 px-2 text-[10px] text-blue-accent"
            >
              <RefreshCw className="w-3 h-3 mr-1" /> Retry
            </Button>
          </div>
        ) : (
          <img
            src={img.url}
            alt={`${img.categoryLabel} Design #${img.number}`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className="w-full h-full object-cover rounded-t-lg"
            style={{ display: loaded ? "block" : "block" }}
          />
        )}
        <Badge className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-blue-accent text-white border-0">
          {img.categoryLabel.split(" ")[0]}
        </Badge>
      </div>
      <div className="p-2">
        <p className="text-xs font-medium text-foreground truncate">
          {img.categoryLabel}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Design #{img.number}
        </p>
        <div className="flex gap-1 mt-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRegenerate(img.id)}
            className="h-6 px-2 text-[10px] text-muted-foreground hover:text-blue-accent flex-1"
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Regen
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            disabled={downloading}
            className="h-6 px-2 text-[10px] text-muted-foreground hover:text-green-400 flex-1"
          >
            {downloading ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Download className="w-3 h-3 mr-1" />
            )}
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(["animals", "space", "abstract"]),
  );
  const [imageSize, setImageSize] = useState<ImageSize>("512");
  const [quantity, setQuantity] = useState<Quantity>("10");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [generationDone, setGenerationDone] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  // Pagination: only render PAGE_SIZE images at a time
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const toggleCategory = useCallback((id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 12) {
        next.add(id);
      } else {
        toast.error("Maximum 12 categories allowed");
      }
      return next;
    });
  }, []);

  const startGenerating = useCallback(async () => {
    if (selectedCategories.size === 0) {
      toast.error("Please select at least one category");
      return;
    }
    setIsGenerating(true);
    setGenerationDone(false);
    setGeneratedImages([]);
    setVisibleCount(PAGE_SIZE);
    setProgress(0);
    setProgressLabel("Preparing images...");

    // Small delay so React can flush the loading UI before the loop starts
    await new Promise((r) => setTimeout(r, 50));

    const qty = Number.parseInt(quantity);
    const categories = ALL_CATEGORIES.filter((c) =>
      selectedCategories.has(c.id),
    );
    const total = categories.length * qty;
    const allImages: GeneratedImage[] = [];

    let count = 0;
    for (const cat of categories) {
      for (let i = 1; i <= qty; i++) {
        const seed = Math.floor(Math.random() * 99999) + i;
        allImages.push({
          id: `${cat.id}-${i}-${seed}`,
          categoryId: cat.id,
          categoryLabel: cat.label,
          number: i,
          seed,
          url: buildPromptUrl(cat.label, seed, imageSize),
        });
        count++;
        if (count % 10 === 0 || count === total) {
          setProgress(Math.round((count / total) * 100));
          setProgressLabel(`Preparing ${count} of ${total} images...`);
          await new Promise((r) => setTimeout(r, 5));
        }
      }
    }

    setGeneratedImages(allImages);
    setProgress(100);
    setProgressLabel(`${total} images ready!`);
    setIsGenerating(false);
    setGenerationDone(true);
    toast.success(`${total} image URLs ready! Loading from Pollinations.ai...`);
  }, [selectedCategories, quantity, imageSize]);

  const regenerateImage = useCallback(
    (imageId: string) => {
      setGeneratedImages((prev) =>
        prev.map((img) => {
          if (img.id !== imageId) return img;
          const newSeed = Math.floor(Math.random() * 99999) + 1;
          return {
            ...img,
            seed: newSeed,
            url: buildPromptUrl(img.categoryLabel, newSeed, imageSize),
          };
        }),
      );
    },
    [imageSize],
  );

  const downloadAll = useCallback(async () => {
    if (generatedImages.length === 0) {
      toast.error("No images to download");
      return;
    }
    const JSZipGlobal = (window as any).JSZip;
    if (!JSZipGlobal) {
      toast.error("ZIP library not loaded. Please refresh the page.");
      return;
    }
    setIsZipping(true);
    setZipProgress(0);
    toast.info(`Downloading ${generatedImages.length} images into ZIP...`);
    try {
      const zip = new JSZipGlobal();
      const total = generatedImages.length;
      let done = 0;
      let failed = 0;
      const batchSize = 5;
      for (let i = 0; i < total; i += batchSize) {
        const batch = generatedImages.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (img) => {
            const blob = await downloadImageAsBlob(img.url);
            if (blob) {
              const filename = `${img.categoryLabel.replace(/\s+/g, "-").toLowerCase()}-design-${img.number}.png`;
              zip.file(filename, blob);
            } else {
              failed++;
            }
            done++;
            setZipProgress(Math.round((done / total) * 100));
          }),
        );
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tshirt-designs.zip";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      if (failed > 0) {
        toast.warning(
          `ZIP ready! ${done - failed} images included, ${failed} failed.`,
        );
      } else {
        toast.success(`All ${total} images downloaded as ZIP!`);
      }
    } catch (err) {
      console.error(err);
      toast.error("ZIP creation failed. Try downloading individually.");
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  }, [generatedImages]);

  const totalImages = generatedImages.length;
  // Only render up to visibleCount images -- prevents browser freeze with 100-300 items
  const visibleImages = useMemo(
    () => generatedImages.slice(0, visibleCount),
    [generatedImages, visibleCount],
  );
  const hasMore = visibleCount < totalImages;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.11 0.01 240) 0%, oklch(0.14 0.012 250) 100%)",
      }}
    >
      <Toaster />

      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-border"
        style={{
          background: "oklch(0.13 0.01 240 / 0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-accent flex items-center justify-center glow-blue-sm">
              <Shirt className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              PrintGenius <span className="text-blue-accent">AI</span>
            </span>
          </div>
          <Button
            onClick={startGenerating}
            disabled={isGenerating}
            className="bg-blue-accent hover:opacity-90 text-white rounded-full px-5 glow-blue-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" /> Start Generating
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 max-w-[1400px] mx-auto w-full px-6 py-6 gap-6">
        {/* Sidebar */}
        <aside className="w-64 shrink-0">
          <div className="card-dark rounded-xl p-4 sticky top-24">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Design Parameters
            </h2>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-accent mb-3">
                Categories
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {selectedCategories.size}/12 selected
              </p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {ALL_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`cat-${cat.id}`}
                      checked={selectedCategories.has(cat.id)}
                      onCheckedChange={() => toggleCategory(cat.id)}
                      className="border-border data-[state=checked]:bg-blue-accent data-[state=checked]:border-blue-accent"
                    />
                    <Label
                      htmlFor={`cat-${cat.id}`}
                      className="text-sm text-foreground cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Image Size
                </Label>
                <Select
                  value={imageSize}
                  onValueChange={(v) => setImageSize(v as ImageSize)}
                >
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512">512x512 (Fast)</SelectItem>
                    <SelectItem value="768">768x768 (Medium)</SelectItem>
                    <SelectItem value="1024">1024x1024 (HD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Images per Category
                </Label>
                <Select
                  value={quantity}
                  onValueChange={(v) => setQuantity(v as Quantity)}
                >
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 images</SelectItem>
                    <SelectItem value="50">50 images</SelectItem>
                    <SelectItem value="100">100 images</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={startGenerating}
              disabled={isGenerating || selectedCategories.size === 0}
              className="w-full bg-blue-accent hover:opacity-90 text-white glow-blue-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" /> Generate Designs
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              Generate
            </h1>
            {totalImages > 0 && (
              <Badge className="bg-blue-accent text-white px-3 py-1">
                {totalImages} designs ready
              </Badge>
            )}
          </div>

          {/* Progress */}
          {isGenerating && (
            <div className="card-dark rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-accent" />{" "}
                  Generating...
                </h3>
                <span className="text-sm text-muted-foreground">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-2 progress-track" />
              <p className="text-xs text-muted-foreground mt-2">
                {progressLabel}
              </p>
            </div>
          )}

          {/* ZIP progress */}
          {isZipping && (
            <div className="card-dark rounded-xl p-4 border border-blue-accent/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-accent" />{" "}
                  Creating ZIP...
                </h3>
                <span className="text-sm text-muted-foreground">
                  {zipProgress}%
                </span>
              </div>
              <Progress value={zipProgress} className="h-2" />
            </div>
          )}

          {/* Done banner */}
          {!isGenerating && generationDone && totalImages > 0 && (
            <div className="card-dark rounded-xl p-4 flex items-center gap-3 border border-green-500/30">
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
              <p className="text-sm text-foreground flex-1">
                <span className="font-semibold text-green-400">
                  {totalImages} designs ready!
                </span>{" "}
                Showing {Math.min(visibleCount, totalImages)} of {totalImages}.
                Download individually or save all as ZIP.
              </p>
              <Button
                onClick={downloadAll}
                disabled={isZipping}
                className="rounded-full border border-blue-accent text-blue-accent bg-transparent hover:bg-blue-accent hover:text-white transition-all px-4 shrink-0"
              >
                {isZipping ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <DownloadCloud className="w-4 h-4 mr-2" />
                )}
                Download All (ZIP)
              </Button>
            </div>
          )}

          {/* Image grid -- paginated */}
          {visibleImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {visibleImages.map((img, idx) => (
                <ImageCard
                  key={img.id}
                  img={img}
                  idx={idx}
                  onRegenerate={regenerateImage}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center py-4">
              <Button
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                variant="outline"
                className="border-blue-accent text-blue-accent hover:bg-blue-accent hover:text-white px-8"
              >
                Load More ({totalImages - visibleCount} remaining)
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!isGenerating && totalImages === 0 && (
            <div className="card-dark rounded-2xl p-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-blue-accent/10 flex items-center justify-center mx-auto mb-4 glow-blue">
                <Shirt className="w-10 h-10 text-blue-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Ready to Create
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                Select categories from the sidebar and click "Generate Designs"
                to create stunning t-shirt print designs using AI.
              </p>
              <Button
                onClick={startGenerating}
                className="bg-blue-accent hover:opacity-90 text-white rounded-full px-8 glow-blue-sm"
              >
                <Zap className="w-4 h-4 mr-2" /> Start Generating
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-accent hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by Pollinations.ai (Free, Unlimited)
          </p>
        </div>
      </footer>
    </div>
  );
}
