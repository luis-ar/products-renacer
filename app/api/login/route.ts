import { type NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    
  try {
    
    const jsonSummary = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
        "service": "common",      
        "method": "login",        
        "args": [
            process.env.NEXT_PUBLIC_ODOO_BD,
            email, 
            password 
        ]
    },
    "id": 1
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_ODOO}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonSummary),
      });


    const data = await response.json();    

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in presign route:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
