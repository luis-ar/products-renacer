"use client";

import { useEffect, useRef, useState } from "react";
import { PlanoUrbanizacionProps, Poligono } from "@/types";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "./ui/scroll-area";

export default function PlanoUrbanizacion({ lotes }: PlanoUrbanizacionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredLote, setHoveredLote] = useState<Poligono | null>(null);
  const [selectedStage, setSelectedStage] = useState<Poligono | null>(null);

  const activeLote = selectedStage || hoveredLote;

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
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = lote.stroke;
      } else if (isHovered) {
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = lote.stroke;
      } else {
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = lote.fill;
      ctx.fill();
      ctx.strokeStyle = lote.stroke;
      ctx.stroke();

      // Reset para no afectar otros dibujos
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      lotes.forEach(lote => {
        const isHovered = hoveredLote?.nombre === lote.nombre;
        const isSelected = selectedStage?.nombre === lote.nombre;
        dibujarPoligono(lote, isHovered, isSelected);
      });
    };

    render();

    const getMousePos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    const findLoteAtPos = (x: number, y: number) => {
      for (const lote of lotes) {
        ctx.beginPath();
        ctx.moveTo(lote.coords[0][0], lote.coords[0][1]);
        lote.coords.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
        ctx.closePath();
        if (ctx.isPointInPath(x, y)) {
          return lote;
        }
      }
      return null;
    };

    const handleMove = (e: MouseEvent) => {
      const { x, y } = getMousePos(e);
      setHoveredLote(findLoteAtPos(x, y));
    };

    const handleClick = (e: MouseEvent) => {
      const { x, y } = getMousePos(e);
      const clicked = findLoteAtPos(x, y);
      setSelectedStage(clicked);
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("click", handleClick);
    
    return () => {
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("click", handleClick);
    };
  }, [lotes, hoveredLote, selectedStage]);

  return (
    <div className="flex h-[600px] w-full gap-4 overflow-hidden rounded-xl border bg-background p-4 shadow-sm text-foreground">
      {/* 70% Map Panel */}
      <div className="flex flex-1 items-center justify-center rounded-lg border bg-muted/20 p-2 overflow-hidden">
        <div className="relative aspect-square w-full max-w-[500px]">
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="h-full w-full object-contain cursor-pointer"
          />
        </div>
      </div>

      {/* 30% Information Panel */}
      <div className="w-[30%] flex flex-col overflow-hidden rounded-lg border bg-muted/10">
        <div className="flex items-center justify-between border-b p-4 bg-muted/20">
          <h3 className="text-lg font-bold">Detalle del Lote</h3>
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

        <ScrollArea className="flex-1 h-full py-4">
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