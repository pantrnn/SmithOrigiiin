'use client'
import Image from "next/image"
import Link from "next/link"

export default function HeaderSection() {
    return (
        <section className="w-full h-screen bg-cover bg-center bg-hero relative pt-15">
            <div className="absolute inset-0 z-10">
                <div className="container mx-auto px-5 md:px-10 xl:px-10 flex items-center justify-between h-full">
                    <div className="flex flex-col items-start justify-center h-full text-white gap-5">
                        
                        <h1 className="text-red-800 font-black text-5xl md:text-7xl sm:text-7xl leading-10 md:leading-15 sm:leading-14">
                            LEVEL UP <br />
                            <span className="text-white text-3xl md:text-5xl sm:text-5xl font-bold">
                                YOUR GAMING GEAR
                            </span>
                        </h1>

                        <p className="max-w-80 md:max-w-lg text-[12px] md:text-sm sm:text-[13px] sm:max-w-sm">
                            Toko penyedia gaming gear nomor 1 di Indonesia. Ikuti terus perkembangan dan produk terbaru dari kami.
                        </p>

                        <Link href="#featured-product">
                            <button className="bg-red-800 cursor-pointer text-white text-sm font-medium py-3 px-6 md:py-4 md:px-7 md:text-[15px] rounded-full hover:bg-red-900 transition-all duration-200">
                                Start Shopping
                            </button>
                        </Link>
                    </div>

                    <Image
                        src="/LogoMain.png"
                        alt="Logo"
                        width={330}
                        height={330}
                        className="hidden lg:block xl:translate-x-5 xl:w-80 lg:w-70"
                    />
                </div>
            </div>
        </section>
    )
}
