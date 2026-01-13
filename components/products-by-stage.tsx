"use client"

import * as React from "react"
import {
  IconTable,
  IconLayoutGrid,
  IconMap,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react"
import { Product, StageData } from "@/lib/types"
import { groupProductsByStage } from "@/lib/product-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StagesMap from "./stages-map"

interface ProductsByStageProps {
  products: Product[]
  loading?: boolean
}

export function ProductsByStage({ products, loading = false }: ProductsByStageProps) {
  const [expandedStages, setExpandedStages] = React.useState<Set<string>>(
    new Set()
  )

  const stageData = React.useMemo(() => {
    return groupProductsByStage(products)
  }, [products])

  const toggleStage = (stageCode: string) => {
    setExpandedStages((prev) => {
      const next = new Set(prev)
      if (next.has(stageCode)) {
        next.delete(stageCode)
      } else {
        next.add(stageCode)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue="table" className="w-full">
        <div className="flex items-center justify-between px-4 lg:px-6">
          <h2 className="text-2xl font-bold tracking-tight">Etapas</h2>
          <TabsList>
            <TabsTrigger value="table" className="gap-2">
              <IconTable className="size-4" />
              <span className="hidden sm:inline">Table</span>
            </TabsTrigger>
            <TabsTrigger value="cards" className="gap-2">
              <IconLayoutGrid className="size-4" />
              <span className="hidden sm:inline">Cards</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <IconMap className="size-4" />
              <span className="hidden sm:inline">Map</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="table" className="px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Etapas</TableHead>
                  <TableHead className="text-center">Total Manzanas</TableHead>
                  <TableHead className="text-center">Total Lotes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stageData.map((stage) => (
                  <React.Fragment key={stage.stageCode}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleStage(stage.stageCode)}
                    >
                      <TableCell>
                        <Button variant="ghost" size="icon" className="size-8">
                          {expandedStages.has(stage.stageCode) ? (
                            <IconChevronDown className="size-4" />
                          ) : (
                            <IconChevronRight className="size-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {stage.stageName}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{stage.totalBlocks}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{stage.totalLots}</Badge>
                      </TableCell>
                    </TableRow>
                    {expandedStages.has(stage.stageCode) && (
                      <TableRow>
                        <TableCell colSpan={4} className="bg-muted/30 p-0">
                          <div className="p-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Manzana</TableHead>
                                  <TableHead className="text-center">
                                    Lotes
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {stage.blocks.map((block) => (
                                  <TableRow key={block.blockCode}>
                                    <TableCell className="font-medium">
                                      {block.blockName}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Badge variant="secondary">
                                        {block.lots.length}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="cards" className="px-4 lg:px-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stageData.map((stage) => (
              <Card key={stage.stageCode} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{stage.stageName}</CardTitle>
                  <CardDescription>
                    {stage.totalBlocks} Manzana{stage.totalBlocks !== 1 ? "s" : ""} •{" "}
                    {stage.totalLots} Lote{stage.totalLots !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Manzanas:</span>
                      <Badge variant="outline">{stage.totalBlocks}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Lotes:</span>
                      <Badge variant="outline">{stage.totalLots}</Badge>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between"
                        onClick={() => toggleStage(stage.stageCode)}
                      >
                        <span>Ver Manzanas</span>
                        {expandedStages.has(stage.stageCode) ? (
                          <IconChevronDown className="size-4" />
                        ) : (
                          <IconChevronRight className="size-4" />
                        )}
                      </Button>
                    </div>
                    {expandedStages.has(stage.stageCode) && (
                      <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                        {stage.blocks.map((block) => (
                          <div
                            key={block.blockCode}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="font-medium">{block.blockName}</span>
                            <Badge variant="secondary" className="text-xs">
                              {block.lots.length} lote{block.lots.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="map" className="px-4 lg:px-6">
          <StagesMap stageData={stageData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
