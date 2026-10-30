export function renderAdjustedToDataUrl(
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  zoom = 1,
  offsetX = 0,
  offsetY = 0
): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const nw = img.naturalWidth || targetW;
  const nh = img.naturalHeight || targetH;
  const baseScale = Math.max(targetW / nw, targetH / nh);
  const scale = baseScale * zoom;
  const drawW = nw * scale;
  const drawH = nh * scale;
  const panRangeX = Math.max(Math.abs(drawW - targetW) / 2, targetW * 0.4);
  const panRangeY = Math.max(Math.abs(drawH - targetH) / 2, targetH * 0.4);
  const dx = (targetW - drawW) / 2 + (offsetX / 100) * panRangeX;
  const dy = (targetH - drawH) / 2 + (offsetY / 100) * panRangeY;
  ctx.clearRect(0, 0, targetW, targetH);
  ctx.drawImage(img, dx, dy, drawW, drawH);
  for (const q of [0.8, 0.68, 0.55, 0.42]) {
    const webp = canvas.toDataURL("image/webp", q);
    if (webp.length <= 14000 && webp.startsWith("data:image/webp")) return webp;
    const jpeg = canvas.toDataURL("image/jpeg", q);
    if (jpeg.length <= 14000) return jpeg;
  }
  return canvas.toDataURL("image/jpeg", 0.35);
}

export function processImageFile(
  file: File,
  targetW = 160,
  targetH = 160
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selecione um arquivo de imagem válido (PNG, JPG, WebP ou SVG)."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo selecionado."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Formato de imagem inválido."));
        return;
      }
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onerror = () => reject(new Error("Não foi possível processar a imagem."));
      img.onload = () => {
        const out = renderAdjustedToDataUrl(img, targetW, targetH, 1, 0, 0);
        if (out) resolve(out);
        else reject(new Error("Falha ao gerar miniatura da imagem."));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
