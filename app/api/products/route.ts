import { type NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    const jsonSummary = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          "odoo_akallpav1",
          2,
          process.env.NEXT_PUBLIC_ODOO_PASSWORD,
          "product.product",
          "search_read",
          [[["active", "=", true]]],
          {
            fields: [
              "id",
              "name",
              "default_code",
              "list_price",
              "type",
              "image_128",
              "active",
            ],
          },
        ],
      },
      id: 1,
    };

    const response = await fetch(process.env.NEXT_PUBLIC_ODOO!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonSummary),
    });

    const data = await response.json();

    const regex = /^E[A-Z0-9]{9}$/;

    const filteredResult = Array.isArray(data?.result)
      ? data.result.filter(
          (product: any) =>
            typeof product.default_code === "string" &&
            regex.test(product.default_code)
        )
      : [];

    return NextResponse.json({
      success: true,
      data: filteredResult,
    });
  } catch (error) {
    console.error("Error in Odoo route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
