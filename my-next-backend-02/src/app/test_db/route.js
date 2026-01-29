import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";

export async function GET() {
  const client = await getClientPromise();
  const db = client.db("testdb"); // database name
  const collection = db.collection("messages");

  const items = await collection.find({}).toArray();

  return NextResponse.json({
    ok: true,
    items,
  });
}

export async function POST(req) {
  const body = await req.json();

  const client = await getClientPromise();
  const db = client.db("testdb");
  const collection = db.collection("messages");

  const result = await collection.insertOne({
    message: body.message || "hello mongo",
    createdAt: new Date(),
  });

  return NextResponse.json({
    ok: true,
    insertedId: result.insertedId,
  });
}