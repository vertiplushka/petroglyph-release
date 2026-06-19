import Link from "next/link";
import { Logo } from "./logo";
import { VkIcon, TelegramIcon, YoutubeIcon, TikTokIcon, OdnoklassnikiIcon } from "./social-icons";

const socials = [
  { href: "https://vk.com/altaiguide",      label: "VK",              Icon: VkIcon },
  { href: "https://t.me/altaiguide",         label: "Telegram",        Icon: TelegramIcon },
  { href: "https://youtube.com/@altaiguide", label: "YouTube",         Icon: YoutubeIcon },
  { href: "https://tiktok.com/@altaiguide",  label: "TikTok",          Icon: TikTokIcon },
  { href: "https://ok.ru/altaiguide",        label: "Одноклассники",   Icon: OdnoklassnikiIcon },
];

const navLinks = [
  { href: "/places",  label: "Места" },
  { href: "/routes",  label: "Маршруты" },
];

const partnerLinks = [
  { href: "/partners",      label: "Партнёрам" },
  { href: "/login/partner", label: "Кабинет партнёра" },
  { href: "/register",      label: "Регистрация" },
];

const legalLinks = [
  { href: "/privacy", label: "Политика конфиденциальности" },
  { href: "/terms",   label: "Условия использования" },
];

export function Footer() {
  return (
    <footer className="bg-[#fffcf3] border-t border-[#e5e5e5] w-full">
      <div className="max-w-[1440px] mx-auto px-4 md:px-16 py-12 md:py-16">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-24">

          {/* Left — brand */}
          <div className="flex flex-col gap-7 max-w-[320px]">
            <Link href="/" className="flex items-center size-[60px]">
              <Logo color="#233516" />
            </Link>

            <p className="font-sans text-sm text-[#666] leading-relaxed">
              Платформа для планирования путешествий по Горному Алтаю с ИИ-гидом, каталогом мест и интерактивной картой.
            </p>

            <div className="flex flex-col gap-1 text-sm font-sans text-[#0e0f11]/70">
              <span>Республика Алтай, Горно-Алтайск</span>
              <a href="mailto:hello@altaiguide.ru" className="hover:text-[#233516] transition-colors">
                hello@altaiguide.ru
              </a>
            </div>

            {/* Socials */}
            <div className="flex gap-2.5">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="size-9 rounded-xl bg-[#233516]/8 flex items-center justify-center text-[#233516] hover:bg-[#233516] hover:text-[#fffcf3] transition-all duration-200"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Right — links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            <div className="flex flex-col gap-4">
              <p className="font-sans font-semibold text-sm text-[#0e0f11]">Навигация</p>
              <div className="flex flex-col gap-2.5">
                {navLinks.map(({ href, label }) => (
                  <Link key={href} href={href} className="font-sans text-sm text-[#666] hover:text-[#233516] transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="font-sans font-semibold text-sm text-[#0e0f11]">Партнёрам</p>
              <div className="flex flex-col gap-2.5">
                {partnerLinks.map(({ href, label }) => (
                  <Link key={href} href={href} className="font-sans text-sm text-[#666] hover:text-[#233516] transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="font-sans font-semibold text-sm text-[#0e0f11]">Правовые</p>
              <div className="flex flex-col gap-2.5">
                {legalLinks.map(({ href, label }) => (
                  <Link key={href} href={href} className="font-sans text-sm text-[#666] hover:text-[#233516] transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#e5e5e5] mt-10 md:mt-14 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <p className="font-sans text-xs text-[#0e0f11]/40">
            © {new Date().getFullYear()} Алтай-гид. Все права защищены.
          </p>
          <div className="flex gap-5">
            {legalLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="font-sans text-xs text-[#0e0f11]/40 hover:text-[#233516] transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
