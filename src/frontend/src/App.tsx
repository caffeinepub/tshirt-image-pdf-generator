import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  FileDown,
  Loader2,
  RefreshCw,
  Save,
  Shirt,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
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

type ImageSize = "512" | "768" | "1024";
type Resolution = "standard" | "high" | "ultra";
type Quantity = "10" | "50" | "100";

interface GeneratedImage {
  id: string;
  categoryId: string;
  categoryLabel: string;
  number: number;
  seed: number;
  url: string;
  loaded: boolean;
  error: boolean;
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

function LazyImage({
  src,
  alt,
  onLoad,
  onError,
}: {
  src: string;
  alt: string;
  onLoad: () => void;
  onError: () => void;
}) {
  const ref = useRef<HTMLImageElement>(null);
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={onLoad}
      onError={onError}
      className="w-full h-full object-cover rounded-t-lg"
    />
  );
}

export default function App() {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(["animals", "space", "abstract"]),
  );
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "generate" | "library"
  >("generate");
  const [imageSize, setImageSize] = useState<ImageSize>("512");
  const [resolution, setResolution] = useState<Resolution>("standard");
  const [quantity, setQuantity] = useState<Quantity>("100");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [pdfModal, setPdfModal] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

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
    setGeneratedImages([]);
    setProgress(0);

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
          id: `${cat.id}-${i}`,
          categoryId: cat.id,
          categoryLabel: cat.label,
          number: i,
          seed,
          url: buildPromptUrl(cat.label, seed, imageSize),
          loaded: false,
          error: false,
        });
        count++;
        if (count % 10 === 0 || count === total) {
          setProgress(Math.round((count / total) * 100));
          setProgressLabel(`Loading ${count} of ${total} images...`);
          await new Promise((r) => setTimeout(r, 50));
        }
      }
    }

    setGeneratedImages(allImages);
    setProgress(100);
    setProgressLabel(`${total} images ready!`);
    setIsGenerating(false);
    toast.success(`${total} images generated!`);
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
            loaded: false,
            error: false,
          };
        }),
      );
    },
    [imageSize],
  );

  const saveSingleImage = useCallback((url: string, title: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.target = "_blank";
    a.click();
    toast.success("Image download started!");
  }, []);

  const generatePDF = useCallback(async () => {
    if (generatedImages.length === 0) {
      toast.error("No images to export");
      return;
    }
    setPdfModal(true);
    setPdfProgress(0);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const cols = 4;
      const margin = 20;
      const labelH = 20;
      const cellW = (pageW - margin * 2) / cols;
      const imgW = cellW - 10;
      const imgH = imgW;
      const cellH = imgH + labelH + 14;
      let x = margin;
      let y = margin;
      let col = 0;

      const total = generatedImages.length;
      let processed = 0;

      for (const img of generatedImages) {
        try {
          const resp = await fetch(img.url);
          const blob = await resp.blob();
          const dataUrl = await new Promise<string>((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result as string);
            reader.onerror = rej;
            reader.readAsDataURL(blob);
          });

          if (y + cellH > pageH - margin && col === 0) {
            doc.addPage();
            y = margin;
          }

          doc.addImage(dataUrl, "JPEG", x + 5, y, imgW, imgH);
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 80);
          doc.text(img.categoryLabel, x + 5, y + imgH + 12);
          doc.text(`Design #${img.number}`, x + 5, y + imgH + 22);
        } catch {
          // skip failed image
        }

        col++;
        x = margin + col * cellW;
        if (col >= cols) {
          col = 0;
          x = margin;
          y += cellH + 10;
        }

        processed++;
        setPdfProgress(Math.round((processed / total) * 100));
      }

      doc.save("tshirt-designs.pdf");
      setPdfModal(false);
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      setPdfModal(false);
      toast.error("PDF generation failed. Please try again.");
    }
  }, [generatedImages]);

  const markLoaded = useCallback((id: string) => {
    setGeneratedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, loaded: true } : img)),
    );
  }, []);

  const markError = useCallback((id: string) => {
    setGeneratedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, error: true } : img)),
    );
  }, []);

  const displayImages = generatedImages.slice(0, 50); // show first 50 in grid
  const totalImages = generatedImages.length;

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

          <nav className="hidden md:flex items-center gap-1">
            {(["dashboard", "generate", "library"] as const).map((tab) => (
              <button
                type="button"
                key={tab}
                data-ocid={`nav.${tab}.link`}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors relative ${
                  activeTab === tab
                    ? "text-blue-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-accent rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>

          <Button
            data-ocid="header.primary_button"
            onClick={() => setActiveTab("generate")}
            className="bg-blue-accent hover:opacity-90 text-white rounded-full px-5 glow-blue-sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            Start Generating
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
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {ALL_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`cat-${cat.id}`}
                      data-ocid={`sidebar.${cat.id}.checkbox`}
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

            <Button
              data-ocid="sidebar.generate.primary_button"
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

          {/* Config card */}
          <div className="card-dark rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-accent" />
              New Generation
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Image Size
                </Label>
                <Select
                  value={imageSize}
                  onValueChange={(v) => setImageSize(v as ImageSize)}
                >
                  <SelectTrigger
                    data-ocid="config.size.select"
                    className="bg-muted border-border"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512">512×512 (Fast)</SelectItem>
                    <SelectItem value="768">768×768 (Medium)</SelectItem>
                    <SelectItem value="1024">1024×1024 (HD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Style
                </Label>
                <Select
                  value={resolution}
                  onValueChange={(v) => setResolution(v as Resolution)}
                >
                  <SelectTrigger
                    data-ocid="config.resolution.select"
                    className="bg-muted border-border"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high">High Detail</SelectItem>
                    <SelectItem value="ultra">Ultra Creative</SelectItem>
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
                  <SelectTrigger
                    data-ocid="config.quantity.select"
                    className="bg-muted border-border"
                  >
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
          </div>

          {/* Progress card */}
          <AnimatePresence>
            {(isGenerating || progress > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card-dark rounded-xl p-5"
                data-ocid="generation.loading_state"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-accent" />{" "}
                        Generating Your Designs...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-400" />{" "}
                        Generation Complete!
                      </>
                    )}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-2 progress-track" />
                <p className="text-xs text-muted-foreground mt-2">
                  {progressLabel}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {generatedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* PDF Download CTA */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">
                    Latest Generated Designs
                  </h3>
                  <Button
                    data-ocid="pdf.download.primary_button"
                    onClick={generatePDF}
                    className="rounded-full border border-blue-accent text-blue-accent bg-transparent hover:bg-blue-accent hover:text-white transition-all glow-blue px-6"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    PDF Download ({totalImages} images)
                  </Button>
                </div>

                {/* Image grid */}
                <div
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                  data-ocid="designs.list"
                >
                  {displayImages.map((img, idx) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                      className="card-dark rounded-xl overflow-hidden group"
                      data-ocid={`designs.item.${idx + 1}`}
                    >
                      <div
                        className="relative aspect-square overflow-hidden"
                        style={{ background: "oklch(0.22 0.012 240)" }}
                      >
                        {!img.loaded && !img.error && (
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            data-ocid={`designs.item.${idx + 1}.loading_state`}
                          >
                            <Loader2 className="w-6 h-6 animate-spin text-blue-accent" />
                          </div>
                        )}
                        {img.error ? (
                          <div
                            className="absolute inset-0 flex flex-col items-center justify-center gap-1"
                            data-ocid={`designs.item.${idx + 1}.error_state`}
                          >
                            <X className="w-6 h-6 text-destructive" />
                            <span className="text-xs text-muted-foreground">
                              Failed
                            </span>
                          </div>
                        ) : (
                          <LazyImage
                            src={img.url}
                            alt={`${img.categoryLabel} Design #${img.number}`}
                            onLoad={() => markLoaded(img.id)}
                            onError={() => markError(img.id)}
                          />
                        )}
                        <Badge className="absolute top-2 left-2 text-xs bg-blue-accent text-white border-0 text-[10px] px-1.5 py-0.5">
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
                            data-ocid={`designs.item.${idx + 1}.secondary_button`}
                            onClick={() => regenerateImage(img.id)}
                            className="h-6 px-2 text-[10px] text-muted-foreground hover:text-blue-accent flex-1"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" /> Regen
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`designs.item.${idx + 1}.save_button`}
                            onClick={() =>
                              saveSingleImage(
                                img.url,
                                `${img.categoryLabel}-design-${img.number}`,
                              )
                            }
                            className="h-6 px-2 text-[10px] text-muted-foreground hover:text-green-400 flex-1"
                          >
                            <Save className="w-3 h-3 mr-1" /> Save
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {totalImages > 50 && (
                  <p className="text-center text-sm text-muted-foreground py-2">
                    Showing 50 of {totalImages} designs. Download PDF for all
                    images.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!isGenerating && generatedImages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-dark rounded-2xl p-16 text-center"
              data-ocid="designs.empty_state"
            >
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
                data-ocid="empty.generate.primary_button"
                onClick={startGenerating}
                className="bg-blue-accent hover:opacity-90 text-white rounded-full px-8 glow-blue-sm"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Generating
              </Button>
            </motion.div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
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

      {/* PDF Generation Modal */}
      <Dialog open={pdfModal} onOpenChange={setPdfModal}>
        <DialogContent
          className="card-dark border-border"
          data-ocid="pdf.modal"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-accent" />
              Generating PDF...
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This may take a few minutes for large batches. Please wait.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Progress value={pdfProgress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {pdfProgress}% complete
            </p>
            <p className="text-xs text-center text-muted-foreground">
              Processing {generatedImages.length} images into PDF...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
