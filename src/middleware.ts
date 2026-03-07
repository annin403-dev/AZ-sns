import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * ミドルウェア：認証状態を確認し、未認証ユーザーをリダイレクトする
 *
 * 保護されたルート（ログイン必須）：
 *   /home, /diagnosis/menu, /wishmap, /sns, /mypage, /goals, /quests, /onboarding
 *
 * 公開ルート（ログイン不要）：
 *   /, /diagnosis（診断本体・未登録でもできる）, /login, /register
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // 環境変数が未設定の場合はスルー（開発初期対応）
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ユーザー情報を取得（常に実行が必要）
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase未設定時はスルー
    return supabaseResponse;
  }

  const { pathname } = request.nextUrl;

  // ─── 保護されたルート（ログイン必須） ───
  const protectedPaths = [
    "/home",
    "/diagnosis/menu",
    "/wishmap",
    "/sns",
    "/mypage",
    "/goals",
    "/quests",
    "/onboarding",
  ];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    // ログイン前にどのページに行こうとしていたか記録してリダイレクト
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ─── 認証ページ（ログイン済みなら不要） ───
  const authPaths = ["/login", "/register"];
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // 静的ファイルとfavicon以外すべてに適用
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
