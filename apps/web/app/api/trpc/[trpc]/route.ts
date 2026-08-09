import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const isBatch = url.searchParams.get('batch') === '1';
  
  // TRPC expects an array of results for batch requests
  if (isBatch) {
    // Generate a safe number of empty mock results to satisfy the batch request
    const mockResults = Array(10).fill({ result: { data: [] } });
    return NextResponse.json(mockResults);
  }
  
  // Single request
  return NextResponse.json({ result: { data: [] } });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const isBatch = url.searchParams.get('batch') === '1';
  
  if (isBatch) {
    const mockResults = Array(10).fill({ result: { data: [] } });
    return NextResponse.json(mockResults);
  }
  
  return NextResponse.json({ result: { data: [] } });
}
