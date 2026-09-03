"use client";

import { OnboardingData } from "@/hooks/use-onboarding";
import { ArrowLeft, ArrowRight, MapPin, User, Building2, AtSign } from "lucide-react";
import { useState } from "react";

interface StepIdentityProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const INDONESIAN_REGIONS: Record<string, string[]> = {
  "Bali": [
    "Denpasar",
    "Badung (Kuta, Canggu, Seminyak)",
    "Gianyar (Ubud)",
    "Tabanan",
    "Buleleng (Singaraja)",
    "Karangasem",
    "Jembrana (Negara)",
    "Klungkung (Nusa Penida)",
    "Bangli",
  ],
  "DKI Jakarta": [
    "Jakarta Selatan",
    "Jakarta Pusat",
    "Jakarta Barat",
    "Jakarta Timur",
    "Jakarta Utara",
    "Kepulauan Seribu",
  ],
  "Jawa Barat": [
    "Kota Bandung",
    "Kota Bekasi",
    "Kota Bogor",
    "Kota Depok",
    "Kota Cimahi",
    "Kota Cirebon",
    "Kota Sukabumi",
    "Kota Tasikmalaya",
    "Kab. Bandung",
    "Kab. Bandung Barat",
    "Kab. Bekasi",
    "Kab. Bogor",
    "Kab. Karawang",
    "Kab. Garut",
    "Kab. Subang",
    "Kab. Purwakarta",
    "Kab. Sumedang",
    "Kab. Indramayu",
    "Kab. Ciamis",
    "Kab. Kuningan",
  ],
  "Jawa Timur": [
    "Kota Surabaya",
    "Kota Malang",
    "Kota Batu",
    "Kota Kediri",
    "Kota Madiun",
    "Kota Pasuruan",
    "Kota Probolinggo",
    "Kab. Sidoarjo",
    "Kab. Gresik",
    "Kab. Malang",
    "Kab. Banyuwangi",
    "Kab. Jember",
    "Kab. Mojokerto",
    "Kab. Bojonegoro",
    "Kab. Lamongan",
    "Kab. Tuban",
    "Kab. Blitar",
    "Kab. Ponorogo",
  ],
  "Jawa Tengah": [
    "Kota Semarang",
    "Kota Surakarta (Solo)",
    "Kota Magelang",
    "Kota Salatiga",
    "Kota Pekalongan",
    "Kota Tegal",
    "Kab. Banyumas (Purwokerto)",
    "Kab. Kudus",
    "Kab. Jepara",
    "Kab. Klaten",
    "Kab. Sukoharjo",
    "Kab. Karanganyar",
    "Kab. Boyolali",
    "Kab. Cilacap",
    "Kab. Brebes",
    "Kab. Kebumen",
  ],
  "DI Yogyakarta": [
    "Kota Yogyakarta",
    "Kab. Sleman",
    "Kab. Bantul",
    "Kab. Gunungkidul",
    "Kab. Kulon Progo",
  ],
  "Banten": [
    "Kota Tangerang",
    "Kota Tangerang Selatan (BSD/Bintaro)",
    "Kota Serang",
    "Kota Cilegon",
    "Kab. Tangerang",
    "Kab. Serang",
    "Kab. Lebak",
    "Kab. Pandeglang",
  ],
  "Sumatera Utara": [
    "Kota Medan",
    "Kota Binjai",
    "Kota Pematangsiantar",
    "Kab. Deli Serdang",
    "Kab. Karo (Berastagi)",
    "Kab. Toba",
    "Kota Tebing Tinggi",
    "Kota Padangsidimpuan",
  ],
  "Sumatera Barat": [
    "Kota Padang",
    "Kota Bukittinggi",
    "Kota Payakumbuh",
    "Kota Pariaman",
    "Kota Solok",
    "Kab. Agam",
    "Kab. Tanah Datar",
  ],
  "Riau & Kepulauan Riau": [
    "Kota Pekanbaru",
    "Kota Batam",
    "Kota Tanjungpinang",
    "Kota Dumai",
    "Kab. Kampar",
    "Kab. Bintan",
    "Kab. Karimun",
  ],
  "Sumatera Selatan": [
    "Kota Palembang",
    "Kota Prabumulih",
    "Kota Lubuklinggau",
    "Kab. Ogan Ilir",
    "Kab. Muara Enim",
    "Kab. Banyuasin",
  ],
  "Lampung": [
    "Kota Bandar Lampung",
    "Kota Metro",
    "Kab. Lampung Selatan",
    "Kab. Lampung Tengah",
    "Kab. Pringsewu",
  ],
  "Sulawesi Selatan": [
    "Kota Makassar",
    "Kota Parepare",
    "Kota Palopo",
    "Kab. Gowa",
    "Kab. Maros",
    "Kab. Bone",
    "Kab. Bulukumba",
  ],
  "Sulawesi Utara": [
    "Kota Manado",
    "Kota Tomohon",
    "Kota Bitung",
    "Kab. Minahasa",
    "Kab. Minahasa Utara",
  ],
  "Kalimantan Timur": [
    "Kota Samarinda",
    "Kota Balikpapan",
    "Kota Bontang",
    "Kab. Kutai Kartanegara (IKN)",
    "Kab. Penajam Paser Utara",
    "Kab. Berau",
  ],
  "Kalimantan Barat": [
    "Kota Pontianak",
    "Kota Singkawang",
    "Kab. Kubu Raya",
    "Kab. Sambas",
    "Kab. Ketapang",
  ],
  "Kalimantan Selatan": [
    "Kota Banjarmasin",
    "Kota Banjarbaru",
    "Kab. Banjar (Martapura)",
    "Kab. Tanah Bumbu",
  ],
  "Nusa Tenggara Barat": [
    "Kota Mataram",
    "Kab. Lombok Barat",
    "Kab. Lombok Tengah",
    "Kab. Lombok Timur",
    "Kab. Lombok Utara",
    "Kab. Sumbawa",
    "Kota Bima",
  ],
  "Nusa Tenggara Timur": [
    "Kota Kupang",
    "Kab. Manggarai Barat (Labuan Bajo)",
    "Kab. Ende",
    "Kab. Sikka (Maumere)",
    "Kab. Sumba Timur",
  ],
  "Papua & Maluku": [
    "Kota Jayapura",
    "Kota Ambon",
    "Kota Ternate",
    "Kota Sorong",
    "Kab. Mimika (Timika)",
    "Kab. Merauke",
  ],
  "Lainnya": [
    "Wilayah Lain di Indonesia",
    "Luar Negeri / Remote",
  ],
};

const PROVINCE_LIST = Object.keys(INDONESIAN_REGIONS);

export function StepIdentity({ data, onUpdate, onNext, onPrev }: StepIdentityProps) {
  const isFreelancer = data.role === "freelancer";

  const parseLocation = (loc: string) => {
    if (!loc) return { province: "Bali", city: "Denpasar" };
    const parts = loc.split(",").map((s) => s.trim());
    if (parts.length >= 2) {
      const cityPart = parts[0];
      const provPart = parts[1];
      if (INDONESIAN_REGIONS[provPart]) {
        return {
          province: provPart,
          city: INDONESIAN_REGIONS[provPart].includes(cityPart)
            ? cityPart
            : INDONESIAN_REGIONS[provPart][0],
        };
      }
    }
    for (const [prov, cities] of Object.entries(INDONESIAN_REGIONS)) {
      if (cities.some((c) => loc.includes(c))) {
        return { province: prov, city: cities.find((c) => loc.includes(c)) || cities[0] };
      }
    }
    return { province: "Bali", city: "Denpasar" };
  };

  const initialLoc = parseLocation(data.locationCity);
  const [selectedProvince, setSelectedProvince] = useState(initialLoc.province);
  const [selectedCity, setSelectedCity] = useState(initialLoc.city);

  const availableCities = INDONESIAN_REGIONS[selectedProvince] || INDONESIAN_REGIONS["Bali"];

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProv = e.target.value;
    setSelectedProvince(newProv);
    const firstCity = INDONESIAN_REGIONS[newProv]?.[0] || "";
    setSelectedCity(firstCity);
    onUpdate({ locationCity: `${firstCity}, ${newProv}` });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setSelectedCity(newCity);
    onUpdate({ locationCity: `${newCity}, ${selectedProvince}` });
  };

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Scaled-up Form Content (No redundant header/badge pill) */}
      <div className="my-auto space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-bold text-foreground">
            {isFreelancer ? "Nama Lengkap / Nama Panggilan" : "Nama PIC / Penanggung Jawab"}
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              id="fullName"
              type="text"
              value={data.fullName}
              onChange={(e) => onUpdate({ fullName: e.target.value })}
              placeholder={isFreelancer ? "Contoh: Budi Santoso" : "Contoh: Hendra Wijaya"}
              className="h-12 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-bold text-foreground">
            Username Akun
          </label>
          <div className="relative">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              id="username"
              type="text"
              value={data.username || ""}
              onChange={(e) =>
                onUpdate({
                  username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""),
                })
              }
              placeholder={isFreelancer ? "budisantoso atau budi_design" : "inovasi_digital"}
              className="h-12 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* 2-Tier Location Selector */}
        <div>
          <label className="mb-2 block text-sm font-bold text-foreground">
            Domisili Wilayah Operasional
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Province Selector */}
            <div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <select
                  id="provinceSelect"
                  value={selectedProvince}
                  onChange={handleProvinceChange}
                  className="h-12 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer shadow-xs"
                >
                  {PROVINCE_LIST.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5 ml-1">Pilih Provinsi</p>
            </div>

            {/* City / Regency Selector */}
            <div>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <select
                  id="citySelect"
                  value={selectedCity}
                  onChange={handleCityChange}
                  className="h-12 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer shadow-xs"
                >
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5 ml-1">Pilih Kota / Kabupaten</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all active:scale-[0.98]"
        >
          <span>Lanjutkan</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
