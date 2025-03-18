import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // 驗證請求數據
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "缺少必要的註冊信息" },
        { status: 400 }
      );
    }

    // 檢查電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "無效的電子郵件格式" },
        { status: 400 }
      );
    }

    // 檢查密碼長度
    if (password.length < 6) {
      return NextResponse.json(
        { message: "密碼必須至少為 6 個字符" },
        { status: 400 }
      );
    }

    // 檢查角色是否有效
    if (role !== "sponsor" && role !== "organizer") {
      return NextResponse.json(
        { message: "無效的用戶角色" },
        { status: 400 }
      );
    }

    // 在實際應用中，這裡會將用戶數據保存到數據庫
    // 目前使用模擬數據
    const userId = Math.random().toString(36).substring(2, 15);
    const newUser = {
      id: userId,
      name,
      email,
      role,
      created_at: new Date().toISOString(),
    };

    // 返回成功響應
    return NextResponse.json(
      { message: "註冊成功", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("註冊錯誤:", error);
    return NextResponse.json(
      { message: "註冊過程中發生錯誤" },
      { status: 500 }
    );
  }
} 