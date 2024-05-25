import React, { useState } from "react";
import useMedia from "@/hooks/useMedia";
import { useRouter } from "next/router";
import { BiCopy } from "react-icons/bi";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { SiVlcmediaplayer } from "react-icons/si";
import { isUndefined } from "lodash";

const Vlc = () => {
    const router = useRouter();
    const { mediaId } = router.query;
    const { data } = useMedia(mediaId as string);
    const [toast, setToast] = useState(false)

    const handleCopy = async () => {
        navigator.clipboard.writeText(`http://kraken.local${data?.videoUrl}`)
        setToast(true)
        await new Promise(f => setTimeout(f, 1000));
        setToast(false)
    }

    const getPath = () => {
        if (isUndefined(data)) return undefined
        let path = data.videoUrl.split("/")
        console.log(path)
        path.splice(0, 2)
        console.log(path)
        return path.join(" > ")
    }

    return (
        <div>
            <Navbar />
            <div className="w-full h-full flex flex-col items-center py-10 md:py-20">
                <div className="text-white text-2xl  md:text-3xl flex flex-row items-center gap-4 font-semibold my-10">
                    <SiVlcmediaplayer className="hidden md:block text-orange-500" size={25} />
                    Start streaming with VLC !
                </div>
                <div className="hidden md:flex max-w-[95%] md:max-w-[90%] h-16 bg-neutral-600 border-2 border-neutral-400 flex-row items-center gap-2 rounded-md px-4 py-2">
                    <p className="max-w-[95%] overflow-hidden truncate text-ellipsis text-white text-light opacity-80">Your link : <a href={`http://kraken.local${data?.videoUrl}`} className="text-white text-base underline cursor-pointer">http://kraken.local{data?.videoUrl}</a></p>
                    <div onClick={handleCopy} className="relative w-[5%] flex flex-col items-center cursor-pointer text-white">
                        <div className="hover:opacity-70 transition-all duration-500">
                            <BiCopy className="w-fit" size={25} />
                        </div>
                        <div className={`absolute ${toast ? "visible" : "hidden"} flex flex-col items-center w-fit top-8 transition-all duration-500`}>
                            <div className="w-4 border-b-neutral-700 border-b-8 border-r-transparent border-r-8 border-l-transparent border-l-8"></div>
                            <div className="h-8 flex flex-row items-center w-14 bg-neutral-700 rounded-md border-neutral-700 border-2 p-2">
                                <p className="text-white text-xs">Copied</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex md:hidden max-w-[95%] md:max-w-[90%] h-fit overflow-hidden bg-neutral-600 border-2 border-neutral-400 flex-col items-start gap-2 rounded-md px-4 py-2">
                    <p className="max-w-[95%] text-white text-light opacity-80">Path : </p>
                    <p className="w-full text-white font-semibold">{getPath()}</p>
                </div>
                <div className="flex flex-col w-full items-start my-10 px-4 md:px-16">
                    <div className=" w-full flex flex-row items-center justify-between">
                        <p className="text-xl font-semibold underline text-white">Tutorial :</p>
                        <a href="/Assets/Apk/vlc.exe" className="hidden md:flex flex-row gap-2 items-center px-4 py-2 my-6 cursor-pointer rounded-md bg-orange-500 hover:opacity-80 transition duration-300">
                            <SiVlcmediaplayer className="text-white mr-2" size={15} />
                            <p className="text-white font-semibold">Download</p>
                        </a>
                        <a href="/Assets/Apk/vlc.apk" className="flex md:hidden flex-row gap-2 items-center px-4 py-2 my-6 cursor-pointer rounded-md bg-orange-500 hover:opacity-80 transition duration-300">
                            <p className="text-white font-semibold">Download</p>
                        </a>
                    </div>
                    <div className="w-full grid grid-flow-row lg:grid-cols-5 gap-4 my-5">
                        <div className="w-full h-fit flex flex-col gap-4 py-2 px-4 rounded-md shadow-black shadow-lg hover:translate-x-1 hover:-translate-y-2 hover:scale-105 transition-all duration-500 cursor-pointer">
                            <p className="h-8 underline text-white">Step 1 : Copy link</p>
                            <img className="w-full lg:w-auto lg:h-24" src="/Assets/Vlc/step1.png" alt="" />
                            <p className="h-5 text-xs text-white text-light">Copy the link above.</p>
                        </div>
                        <div className="w-full h-fit flex flex-col gap-4 py-2 px-4 rounded-md shadow-black shadow-lg hover:translate-x-1 hover:-translate-y-2 hover:scale-105 transition-all duration-500 cursor-pointer">
                            <p className="h-8 underline text-white">Step 2 : Open VLC</p>
                            <img className="w-full lg:w-auto lg:h-24" src="/Assets/Vlc/step2.png" alt="" />
                            <p className="h-5 text-xs text-white text-light">Open the &quot;Media&quot; tab..</p>
                        </div>
                        <div className="w-full h-fit flex flex-col gap-4 py-2 px-4 rounded-md shadow-black shadow-lg hover:translate-x-1 hover:-translate-y-2 hover:scale-105 transition-all duration-500 cursor-pointer">
                            <p className="h-8 underline text-white">Step 3 : Open a stream</p>
                            <img className="w-full lg:w-auto lg:h-24" src="/Assets/Vlc/step3.png" alt="" />
                            <p className="h-5 text-xs text-white text-light">Open a network stream.</p>
                        </div>
                        <div className="w-full h-fit flex flex-col gap-4 py-2 px-4 rounded-md shadow-black shadow-lg hover:translate-x-1 hover:-translate-y-2 hover:scale-105 transition-all duration-500 cursor-pointer">
                            <p className="h-8 underline text-white">Step 4 : Paste & Play</p>
                            <img className="w-full lg:w-auto lg:h-24" src="/Assets/Vlc/step4.png" alt="" />
                            <p className="h-5 text-xs text-white text-light">Paste the link and hit play.</p>
                        </div>
                        <div className="w-full h-fit flex flex-col gap-4 py-2 px-4 rounded-md shadow-black shadow-lg hover:translate-x-1 hover:-translate-y-2 hover:scale-105 transition-all duration-500 cursor-pointer">
                            <p className="h-8 underline text-white">Step 5 : Enjoy !</p>
                            <img className="w-full lg:w-auto lg:h-24" src="/Assets/Vlc/step5.png" alt="" />
                            <p className="h-5 text-xs text-white text-light">With full audio & subtitles.</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
export default Vlc;