import Link from "next/link";
import { LogoMark } from "@/components/ui/logo-mark";
import { SITE_IMAGES } from "@/lib/site-images";

export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
      <aside className="relative hidden overflow-hidden bg-ink lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: `url('${SITE_IMAGES.promo}')` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/30" />
        <div
          className="pointer-events-none absolute -left-24 bottom-1/4 h-96 w-96 rounded-full bg-champagne/15 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex h-full flex-col justify-between p-12 xl:p-14">
          <Link href="/" className="group inline-flex w-fit items-center gap-3" aria-label="Manuella Sole Footwear">
            <LogoMark size={44} />
            <span className="flex flex-col">
              <span className="font-display text-[24px] leading-none tracking-[0.2em] text-ivory transition-colors group-hover:text-champagne">
                MANUELLA
              </span>
              <span className="mt-1.5 text-[7px] font-semibold uppercase leading-none tracking-[0.46em] text-ivory/45">
                Sole Footwear
              </span>
            </span>
          </Link>

          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-champagne" aria-hidden="true" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-champagne">
                Private workspace
              </p>
            </div>
            <p className="mt-5 font-display text-[40px] leading-[1.08] text-ivory xl:text-[46px]">
              Every pair,
              <br />
              <span className="italic text-champagne">accounted for.</span>
            </p>
            <p className="mt-5 max-w-sm text-[13px] leading-[1.85] text-ivory/55">
              Stock, sales and profit — recorded with care so the shop floor and the books
              always agree.
            </p>
            <dl className="mt-9 grid grid-cols-2 gap-6 border-t border-ivory/10 pt-6 text-ivory/70">
              {[
                ["01", "Handpicked inventory"],
                ["02", "Personal, WhatsApp-first service"],
                ["03", "UK & EU sizing guidance"],
                ["04", "Honest, considered pricing"],
              ].map(([num, label]) => (
                <div key={num} className="flex items-start gap-3">
                  <dt className="font-display text-[15px] italic text-champagne/80">{num}</dt>
                  <dd className="text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-ivory/45">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/30">
            Accra · Ghana · MMXXVI
          </p>
        </div>
      </aside>

      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-line bg-ivory/60 px-6 py-4 backdrop-blur lg:px-12">
          <Link href="/" className="flex items-center gap-2 font-display text-[17px] tracking-[0.2em] text-ink lg:hidden">
            <LogoMark size={28} />
            MANUELLA
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex h-9 items-center gap-2 rounded-full border border-line px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ash transition-colors hover:border-line-dark hover:text-ink"
          >
            Back to storefront
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
