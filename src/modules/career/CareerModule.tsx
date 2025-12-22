import CareerHero from "./CareerHero";
import CareerCards from "./CareerCards";

export default function CareerModule() {
  return (
    <main className="bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-6">
        <CareerHero />
        <CareerCards />
      </div>
    </main>
  );
}
