// 'use client'
// import React from "react";
// import {
//   Headphones,
//   Gem,
//   Box,
//   Truck,
//   Gamepad2
// } from "lucide-react";

// export default function SuggestCard() {
//   const SuggestContent = [
//     {
//       logo: <Headphones className="w-8 h-8 text-blue-500" />,
//       title: "Free Consultation",
//       content: "Expert guidance to choose your perfect gaming gear",
//     },
//     {
//       logo: <Gem className="w-8 h-8 text-purple-500" />,
//       title: "Premium Quality",
//       content: "Only tested and trusted gaming equipment",
//     },
//     {
//       logo: <Box className="w-8 h-8 text-orange-500" />,
//       title: "Safe Packing",
//       content: "Extra protection for perfect delivery",
//     },
//     {
//       logo: <Truck className="w-8 h-8 text-green-500" />,
//       title: "Fast Delivery",
//       content: "Quick and reliable shipping nationwide",
//     },
//     {
//       logo: <Gamepad2 className="w-8 h-8 text-red-500" />,
//       title: "Trusted Choice",
//       content: "Thousands of gamers trust us",
//     },
//   ];

//   return (
//     <section className="flex flex-col gap-8 sm:gap-10 px-4 sm:px-0">
//       <h1 className="text-center font-bold text-xl sm:text-2xl text-gray-900">
//         Why Us?
//       </h1>

//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
//         {SuggestContent.map((item, index) => (
//           <div
//             key={index}
//             className="flex flex-col items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-300 aspect-square group"
//           >
//             <div className="shrink-0 group-hover:scale-110 transition-transform duration-300">
//               {item.logo}
//             </div>
//             <div className="flex flex-col items-center text-center gap-1.5">
//               <h2 className="text-sm sm:text-base font-semibold text-gray-800 leading-tight">
//                 {item.title}
//               </h2>
//               <p className="text-xs sm:text-sm text-gray-600 leading-snug">
//                 {item.content}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }