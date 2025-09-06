import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    sites: ['ficbook', 'authortoday', 'ao3', 'fanficsme', 'litnet']
  })
}
