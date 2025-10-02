import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "No user session" }, { status: 401 });
    }

    return NextResponse.json({
      user: session.user,
      userId: session.userId || session.user.sub,
      accessToken: session.accessToken,
    });
  } catch (error) {
    console.error("Error getting user session:", error);
    return NextResponse.json(
      { error: "Failed to get user session" },
      { status: 500 }
    );
  }
}
