"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { ProductsByStage } from "@/components/products-by-stage"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import data from "./data.json"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { Product } from "@/lib/types"
import StagesMap from "@/components/stages-map"

export default function Page() {
    const [productos, setProductos] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
      const fetchProductos = async () => {
        setLoading(true)
        const response = await fetch("/api/products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
        })        
        const data = await response.json()
        setProductos(data.data)
        setLoading(false)
      }
      fetchProductos()
    }, [])
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className="min-h-[calc(100vh-56px)]! w-full"
    >
      <AppSidebar variant="inset" />
      
      <ScrollArea className="h-[calc(100vh-56px)] w-full">
        <SidebarInset className="m-0! rounded-none! h-full">
        {/* <SiteHeader /> */}
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div> */}
              <ProductsByStage products={productos} loading={loading} />
            </div>
          </div>
        </div>
      </SidebarInset>
      </ScrollArea>
      
    </SidebarProvider>
  )
}
