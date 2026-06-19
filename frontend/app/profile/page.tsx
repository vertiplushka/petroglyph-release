"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Mail, Phone, Lock, Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { Field, Input, PrimaryButton } from "@/components/form";
import {
  getUserToken,
  apiUserMe,
  apiFavorites,
  apiRemoveFavorite,
  type UserProfile,
  type Favorite,
} from "@/lib/user-auth";

const tabs = [
  { id: "favorites", label: "Избранное" },
  { id: "profile", label: "Профиль" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab] = useState("favorites");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getUserToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    Promise.all([apiUserMe(token), apiFavorites(token)]).then(([u, favs]) => {
      if (!u) {
        router.replace("/login");
        return;
      }
      setUser(u);
      setFavorites(favs);
      setLoading(false);
    });
  }, [router]);

  async function removeFavorite(id: number) {
    const token = getUserToken();
    if (!token) return;
    const ok = await apiRemoveFavorite(token, id);
    if (ok) setFavorites((prev) => prev.filter((f) => f.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-92px)] flex items-center justify-center bg-[#fffcf3]">
        <p className="font-sans text-sm text-[#233516]/50 animate-pulse">Загрузка…</p>
      </div>
    );
  }

  const greeting = user?.name
    ? `Привет, ${user.name}`
    : `Привет, ${user?.email ?? user?.phone ?? "турист"}`;

  return (
    <DashboardShell
      greeting={greeting}
      tabs={tabs}
      activeTab={tab}
      onTabChange={setTab}
      title={tab === "favorites" ? "Избранное" : "Профиль"}
    >
      {tab === "favorites" ? (
        <FavoritesTab favorites={favorites} onRemove={removeFavorite} />
      ) : (
        <ProfileForm user={user} />
      )}
    </DashboardShell>
  );
}

function FavoritesTab({
  favorites,
  onRemove,
}: {
  favorites: Favorite[];
  onRemove: (id: number) => void;
}) {
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Heart className="size-10 text-[#233516]/20" />
        <p className="font-sans text-[#0e0f11]/50 text-sm">
          Вы ещё не сохранили ни одного маршрута
        </p>
        <Link
          href="/"
          className="font-sans text-sm text-[#233516] underline hover:opacity-70"
        >
          Перейти к планированию маршрута
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {favorites.map((fav) => {
        const href = fav.placeIds?.length
          ? `/route-detail?ids=${fav.placeIds.join(",")}`
          : fav.routeId
            ? `/routes/${fav.routeId}`
            : "#";

        return (
          <div
            key={fav.id}
            className="flex items-center justify-between gap-4 bg-white rounded-xl border border-[#e8e4d8] px-5 py-4 shadow-sm"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <Link
                href={href}
                className="font-sans font-semibold text-[#0e0f11] hover:text-[#233516] transition truncate"
              >
                {fav.title}
              </Link>
              <p className="font-sans text-xs text-[#0e0f11]/40">
                {new Date(fav.createdAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {fav.placeIds?.length ? ` · ${fav.placeIds.length} мест` : ""}
              </p>
            </div>
            <button
              onClick={() => onRemove(fav.id)}
              className="flex-shrink-0 text-[#0e0f11]/30 hover:text-red-500 transition"
              title="Удалить из избранного"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ProfileForm({ user }: { user: UserProfile | null }) {
  return (
    <form className="flex flex-col gap-6 max-w-[760px]">
      <h2 className="font-display text-xl font-semibold text-[#0e0f11]">Информация</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {user?.email && (
          <div className="md:col-span-2">
            <Field label="Email">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0e0f11]/50">
                  <Mail className="size-4" />
                </span>
                <Input defaultValue={user.email} className="pl-10" readOnly />
              </div>
            </Field>
          </div>
        )}
        {user?.phone && (
          <Field label="Номер телефона">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0e0f11]/50">
                <Phone className="size-4" />
              </span>
              <Input defaultValue={user.phone} className="pl-10" readOnly />
            </div>
          </Field>
        )}
        <Field label="Новый пароль">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0e0f11]/50">
              <Lock className="size-4" />
            </span>
            <Input type="password" placeholder="••••••••" className="pl-10 pr-10" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0e0f11]/50">
              <Eye className="size-4" />
            </span>
          </div>
        </Field>
        <Field label="Подтвердить пароль">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0e0f11]/50">
              <Lock className="size-4" />
            </span>
            <Input type="password" placeholder="••••••••" className="pl-10" />
          </div>
        </Field>
      </div>
      <PrimaryButton className="w-fit px-8" type="button">
        Обновить пароль
      </PrimaryButton>
    </form>
  );
}
