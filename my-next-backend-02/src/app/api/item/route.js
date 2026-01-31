import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// --- CONFIGURATION ---
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 1. OPTIONS (Fixes CORS errors)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: CORS_HEADERS });
}

// 2. GET (Read with Pagination)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    const client = await getClientPromise();
    const db = client.db("wad-01");
    
    // Get total count for frontend pagination logic
    const totalItems = await db.collection("item").countDocuments();
    
    // Fetch paginated data
    const items = await db.collection("item")
      .find({})
      .sort({ _id: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page
    }, { 
      status: 200, 
      headers: { ...CORS_HEADERS, "Cache-Control": "no-store" } 
    });
  } catch (error) {
    return NextResponse.json({ error: error.toString() }, { status: 500, headers: CORS_HEADERS });
  }
}

// 3. POST (Insert New Item)
export async function POST(req) {
  try {
    const data = await req.json();
    const client = await getClientPromise();
    const db = client.db("wad-01");

    const newItem = {
      itemName: data.itemName,
      itemCategory: data.itemCategory,
      itemPrice: Number(data.itemPrice),
      status: data.status || "Active", // Default status
    };

    const result = await db.collection("item").insertOne(newItem);

    return NextResponse.json({ id: result.insertedId, ...newItem }, { status: 201, headers: CORS_HEADERS });
  } catch (error) {
    return NextResponse.json({ error: error.toString() }, { status: 500, headers: CORS_HEADERS });
  }
}

// 4. PUT (Update Existing Item)
export async function PUT(req) {
  try {
    const data = await req.json();
    const { _id, ...rest } = data; // Separate ID from the rest

    if (!_id) {
      return NextResponse.json({ message: "ID required" }, { status: 400, headers: CORS_HEADERS });
    }

    // FIX: Explicitly format the fields to ensure types stay correct (e.g. Price is Number)
    const updateFields = {
      ...rest, // Keep other fields if any
    };

    // If price is present in the update, force it to be a Number
    if (updateFields.itemPrice) {
      updateFields.itemPrice = Number(updateFields.itemPrice);
    }

    const client = await getClientPromise();
    const db = client.db("wad-01");

    await db.collection("item").updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateFields }
    );

    return NextResponse.json({ message: "Updated successfully" }, { status: 200, headers: CORS_HEADERS });
  } catch (error) {
    return NextResponse.json({ error: error.toString() }, { status: 500, headers: CORS_HEADERS });
  }
}
// 5. DELETE (Delete Item)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400, headers: CORS_HEADERS });

    const client = await getClientPromise();
    const db = client.db("wad-01");

    await db.collection("item").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200, headers: CORS_HEADERS });
  } catch (error) {
    return NextResponse.json({ error: error.toString() }, { status: 500, headers: CORS_HEADERS });
  }
}