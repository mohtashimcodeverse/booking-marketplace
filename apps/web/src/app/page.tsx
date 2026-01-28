import HeroLux from "@/components/home/HeroLux";
import HomeSearchFloating from "@/components/home/HomeSearchFloating";
import LuxSectionDivider from "@/components/ui/LuxSectionDivider";

import HomeFeaturedCarousel from "@/components/home/HomeFeaturedCarousel";
import HomeAbout from "@/components/home/HomeAbout";
import HomeRoomsShowcase from "@/components/home/HomeRoomsShowcase";
import HomeOffers from "@/components/home/HomeOffers";
import HomeStatsBand from "@/components/home/HomeStatsBand";
import HomeTestimonials from "@/components/home/HomeTestimonials";
import HomeContactCta from "@/components/home/HomeContactCta";

export default function HomePage() {
  return (
    <div className="bg-white">
      <HeroLux />
      <HomeSearchFloating />

      <HomeFeaturedCarousel />

      {/* dark section starts later; avoid harsh cut with divider */}
      <LuxSectionDivider from="#FFFFFF" to="#0F1720" />
      <HomeRoomsShowcase />

      <LuxSectionDivider from="#0F1720" to="#FFFFFF" />
      <HomeAbout />
      <HomeOffers />
      <HomeStatsBand />
      <HomeTestimonials />
      <HomeContactCta />
    </div>
  );
}
