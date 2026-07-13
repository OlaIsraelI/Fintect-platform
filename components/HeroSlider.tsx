"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  {
    title: "Send Money Instantly",
    description: "Transfer funds to anyone, anywhere in seconds",
    bgColor: "from-blue-600 to-blue-800",
    image: "/images/send-money.svg",
  },
  {
    title: "Secure Payments",
    description: "Your money is protected with enterprise-grade security",
    bgColor: "from-green-600 to-green-800",
    image: "/images/secure-payments.svg",
  },
  {
    title: "Smart Banking",
    description: "Manage your finances with powerful tools and insights",
    bgColor: "from-purple-600 to-purple-800",
    image: "/images/smart-banking.svg",
  },
];

export default function HeroSlider() {
  return (
    <div className="h-screen w-full">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className={`h-full w-full bg-gradient-to-br ${slide.bgColor} flex items-center justify-center px-4`}
            >
              <div className="max-w-7xl mx-auto text-center text-white">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
                  {slide.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/auth/register"
                    className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
                  >
                    Get Started
                  </a>
                  <a
                    href="/auth/login"
                    className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105"
                  >
                    Sign In
                  </a>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
