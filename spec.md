# T-Shirt Image Generator + PDF Exporter

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Category selection UI: predefined list of 15+ t-shirt-relevant categories, user selects 10-12
- Image generation using Pollinations.ai free API (URL-based, no API key needed)
  - Prompt format: `https://image.pollinations.ai/prompt/{category} t-shirt print design, vector art, no background, high quality?width=512&height=512&seed={seed}&nologo=true`
  - 100 images per selected category
- Progress tracking UI: shows generation progress (e.g., 450/1000 images)
- PDF export using jsPDF + html2canvas or direct image embedding
  - Grid layout: 4 images per row
  - Each image has category label + index below it
  - All selected categories' images in one PDF
- Download button for the final PDF

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Frontend-only app (Pollinations.ai is URL-based, called from browser)
2. Category selection screen with checkboxes (max 12)
3. Generate button triggers sequential/batched fetch of images from Pollinations.ai
4. Progress bar showing X/total images generated
5. Preview grid showing generated images
6. Export to PDF using jsPDF library (install via npm)
7. PDF contains all images in 4-per-row grid with labels
8. Download PDF button

### Categories (predefined):
Animals, Space & Galaxy, Abstract Art, Nature & Botanical, Geometric Patterns, Vintage & Retro, Skulls & Dark Art, Mandala & Spiritual, Ocean & Marine, Fantasy & Dragons, Music & Instruments, Sports & Adventure, Food & Drinks, Flowers & Floral, Funny & Cartoon
