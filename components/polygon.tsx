"use client";

import { useEffect, useRef, useState } from "react";
import { PlanoUrbanizacionProps, Poligono } from "@/types";
import { IconX, IconZoomIn, IconZoomOut, IconMaximize } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "./ui/scroll-area";

export default function PlanoUrbanizacion({ lotes }: PlanoUrbanizacionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredLote, setHoveredLote] = useState<Poligono | null>(null);
  const [selectedStage, setSelectedStage] = useState<Poligono | null>(null);
  
  // Zoom and Pan State
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const activeLote = selectedStage || hoveredLote;

  // Auto-fit on load
  useEffect(() => {
    if (lotes.length === 0) return;
    
    // Find bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    lotes.forEach(lote => {
      lote.coords.forEach(([x, y]) => {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      });
    });

    const padding = 40;
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Calculate scale to fit 500x500
    const scaleX = (500 - padding * 2) / width;
    const scaleY = (500 - padding * 2) / height;
    const newScale = Math.min(scaleX, scaleY);
    
    setScale(newScale);
    setOffset({
      x: (500 - width * newScale) / 2 - minX * newScale,
      y: (500 - height * newScale) / 2 - minY * newScale
    });
  }, [lotes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dibujarPoligono = (lote: Poligono, isHovered: boolean, isSelected: boolean) => {
      ctx.beginPath();
      ctx.moveTo(lote.coords[0][0], lote.coords[0][1]);
      lote.coords.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();

      // Opacidad y brillo según estado
      if (isSelected) {
        ctx.globalAlpha = 1;
        ctx.lineWidth = 3 / scale;
        ctx.shadowBlur = 10 / scale;
        ctx.shadowColor = lote.stroke;
      } else if (isHovered) {
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 2 / scale;
        ctx.shadowBlur = 5 / scale;
        ctx.shadowColor = lote.stroke;
      } else {
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 1 / scale;
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = lote.fill;
      ctx.fill();
      ctx.strokeStyle = lote.stroke;
      ctx.stroke();

      // Reset para no afectar otros dibujos
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1 / scale;
      ctx.shadowBlur = 0;
    };

    const dibujarLabel = (lote: Poligono) => {
      // Calcular centroide simple
      let sumX = 0, sumY = 0;
      lote.coords.forEach(([x, y]) => {
        sumX += x;
        sumY += y;
      });
      const centerX = sumX / lote.coords.length;
      const centerY = sumY / lote.coords.length;

      // Formatear nombre: "Stage 1" -> "E01"
      const numMatch = lote.nombre.match(/\d+/);
      const labelText = numMatch ? `E${numMatch[0].padStart(2, '0')}` : lote.nombre.substring(0, 3).toUpperCase();

      ctx.save();
      ctx.translate(centerX, centerY);
      // Invertir escala para que el texto no se deforme/desaparezca al hacer zoom mínimo
      // Pero limitamos el tamaño mínimo visual del texto
      const textScale = Math.max(0.5 / scale, 0.05 / scale); // Ajuste dinámico
      
      ctx.font = `bold ${14 / scale}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Halo blanco para legibilidad
      ctx.strokeStyle = "white";
      ctx.lineWidth = 4 / scale;
      ctx.strokeText(labelText, 0, 0);
      
      ctx.fillStyle = lote.stroke; // Usar el color del borde para el texto
      ctx.fillText(labelText, 0, 0);
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);
      
      // Dibujar polígonos
      lotes.forEach(lote => {
        const isHovered = hoveredLote?.nombre === lote.nombre;
        const isSelected = selectedStage?.nombre === lote.nombre;
        dibujarPoligono(lote, isHovered, isSelected);
      });

      // Dibujar labels encima
      lotes.forEach(lote => dibujarLabel(lote));
      
      ctx.restore();
    };

    render();

    const getMousePos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left) * (canvas.width / rect.width);
      const canvasY = (e.clientY - rect.top) * (canvas.height / rect.height);
      
      return {
        x: (canvasX - offset.x) / scale,
        y: (canvasY - offset.y) / scale
      };
    };

    const findLoteAtPos = (x: number, y: number) => {
      for (const lote of lotes) {
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);
        ctx.beginPath();
        ctx.moveTo(lote.coords[0][0], lote.coords[0][1]);
        lote.coords.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
        ctx.closePath();
        
        const rawX = (x * scale + offset.x);
        const rawY = (y * scale + offset.y);
        
        if (ctx.isPointInPath(rawX, rawY)) {
          ctx.restore();
          return lote;
        }
        ctx.restore();
      }
      return null;
    };

    const handleMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        setOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
      } else {
        const { x, y } = getMousePos(e);
        setHoveredLote(findLoteAtPos(x, y));
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (isDragging) return;
      const { x, y } = getMousePos(e);
      const clicked = findLoteAtPos(x, y);
      setSelectedStage(clicked);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.0015;
      const factor = 1 - e.deltaY * zoomSpeed;
      
      // Limites mucho más amplios para evitar que desaparezcan por clamping a 0.1
      const newScale = Math.max(1e-8, Math.min(1e8, scale * factor));
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
      
      const worldX = (mouseX - offset.x) / scale;
      const worldY = (mouseY - offset.y) / scale;
      
      setScale(newScale);
      setOffset({
        x: mouseX - worldX * newScale,
        y: mouseY - worldY * newScale
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      const { x, y } = getMousePos(e);
      const hit = findLoteAtPos(x, y);
      
      // Only drag if not clicking a polygon
      if (!hit) {
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [lotes, hoveredLote, selectedStage, scale, offset, isDragging, lastMousePos]);

  const performZoom = (factor: number) => {
    const newScale = Math.max(1e-8, Math.min(1e8, scale * factor));
    
    // Zoom centered on canvas
    const centerX = 250; 
    const centerY = 250;
    
    const worldX = (centerX - offset.x) / scale;
    const worldY = (centerY - offset.y) / scale;
    
    setScale(newScale);
    setOffset({
      x: centerX - worldX * newScale,
      y: centerY - worldY * newScale
    });
  };

  const handleZoomIn = () => performZoom(1.2);
  const handleZoomOut = () => performZoom(1 / 1.2);
  const handleReset = () => {
    if (lotes.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    lotes.forEach(lote => {
      lote.coords.forEach(([x, y]) => {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      });
    });
    const padding = 40;
    const width = maxX - minX;
    const height = maxY - minY;
    const scaleX = (500 - padding * 2) / width;
    const scaleY = (500 - padding * 2) / height;
    const newScale = Math.min(scaleX, scaleY);
    setScale(newScale);
    setOffset({
      x: (500 - width * newScale) / 2 - minX * newScale,
      y: (500 - height * newScale) / 2 - minY * newScale
    });
  };

  return (
    <div className="flex h-[600px] w-full gap-4 overflow-hidden rounded-xl border bg-background p-4 shadow-sm text-foreground">
      {/* 70% Map Panel */}
      <div className="relative flex flex-1 items-center justify-center rounded-lg border bg-muted/20 p-2 overflow-hidden group">
        <div className="relative aspect-square w-full max-w-full max-h-full">
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className={`h-full w-full object-contain cursor-pointer ${isDragging ? "cursor-grabbing" : "cursor-crosshair"}`}
          />
        </div>
        
        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 rounded-md border bg-background/80 p-1 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="size-8" onClick={handleZoomIn}>
            <IconZoomIn className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={handleZoomOut}>
            <IconZoomOut className="size-4" />
          </Button>
          <div className="h-px bg-border mx-1" />
          <Button variant="ghost" size="icon" className="size-8" onClick={handleReset}>
            <IconMaximize className="size-4" />
          </Button>
        </div>
      </div>

      {/* 30% Information Panel */}
      <div className="w-[30%] flex flex-col overflow-hidden rounded-lg border bg-muted/10">
        <div className="flex items-center justify-between border-b p-4 bg-muted/20">
          <h3 className="text-lg font-bold">Detalle de la Etapa</h3>
          {selectedStage && (
            <Button 
                variant="ghost" 
                size="icon" 
                className="size-8"
                onClick={() => setSelectedStage(null)}
            >
              <IconX className="size-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 h-[calc(100%-65px)] py-4">
          <div className="flex-1 p-4">
            {activeLote ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Nombre</p>
                    {selectedStage?.nombre === activeLote.nombre && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">ACTIVO</span>
                    )}
                </div>
                <h4 className="text-xl font-bold text-primary">{activeLote.nombre}</h4>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Dimensiones</p>
                <div className="rounded-md bg-background/50 p-3 border">
                  <p className="text-xs font-mono break-all text-muted-foreground leading-relaxed">
                    {activeLote.coords.map(c => `(${c[0]}, ${c[1]})`).join(" ")}
                  </p>
                </div>
              </div>

              {activeLote.metadata && (
                <div className="space-y-4 pt-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Resumen de Etapa</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col rounded-md border bg-background p-2 shadow-sm text-center">
                      <span className="text-[10px] text-muted-foreground uppercase">Manzanas</span>
                      <span className="text-lg font-bold">{activeLote.metadata.totalBlocks}</span>
                    </div>
                    <div className="flex flex-col rounded-md border bg-background p-2 shadow-sm text-center">
                      <span className="text-[10px] text-muted-foreground uppercase">Total Lotes</span>
                      <span className="text-lg font-bold">{activeLote.metadata.totalLots}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detalle por Manzana</p>
                    <div className="max-h-[200px] space-y-1 overflow-y-auto rounded-md border p-2 bg-muted/5">
                      {activeLote.metadata.blocks.map((block, i) => (
                        <div key={i} className="flex items-center justify-between rounded bg-background p-2 text-sm border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <span className="font-medium">{block.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-primary">{block.lotCount}</span>
                            <span className="text-[10px] text-muted-foreground">lotes</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 items-center">
                <div 
                  className="size-4 rounded-full border shadow-sm" 
                  style={{ backgroundColor: activeLote.fill, borderColor: activeLote.stroke }}
                />
                <span className="text-xs text-muted-foreground">Color de zona en el plano</span>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  {selectedStage 
                    ? "Haga clic en otro lote para cambiar la selección o use el botón de cerrar."
                    : "Pase el mouse por el mapa o haga clic en un lote para mantener la información fija."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-[80%] flex-col items-center justify-center text-center opacity-50">
              <p className="text-sm text-muted-foreground">
                Seleccione un lote en el mapa para ver sus detalles
              </p>
            </div>
          )}
        </div>
        </ScrollArea>
        
        
      </div>
    </div>
  );
}