import { AdminLayout } from "@/pages/_app";
import axios from "axios";
import useSWR from "swr";
import { useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import useUsers from "@/hooks/useUsers";
import { MdRefresh, MdSearch, MdGroups, MdOutlineEdit, MdSync, MdBlock } from "react-icons/md";
import { BsDatabaseFillX } from "react-icons/bs";
import { BiMovie } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";
import { IoWarning } from "react-icons/io5";
import { HiOutlineTrash } from "react-icons/hi2";
import { TbDatabaseImport, TbDatabaseExport } from "react-icons/tb";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { isUndefined } from "lodash";

export default function Users() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = new URLSearchParams(useSearchParams());
    const q = searchParams.get("q");
    const { data: users, mutate: mutateUsers } = useUsers({ searchText: q } || undefined);
    const [purgeAction, setPurgeAction] = useState(false)
    const [purgeValidation, setPurgeValidation] = useState("")

    const handleSearch = (e: any) => {
        if (e.target.value) {
            searchParams.set("q", e.target.value);
            router.replace(`${pathname}?${searchParams}`);
        } else {
            router.replace(`${pathname}`);
        }
    }

    const blockUser = async (userId: string) => {
        await axios.post("/api/users", { userId: userId, userRoles: "" }).catch((err) => {
            toast.clearWaitingQueue()
            toast.error("Something went wrong.", { containerId: "AdminContainer" })
        }).then((data) => {
            if (!isUndefined(data)) {
                toast.clearWaitingQueue()
                toast.success("User blocked.", { containerId: "AdminContainer" })
                mutateUsers()
            }
        })
    }

    const jsonExport = () => {
        const jsonData = JSON.stringify({
            "Titles": users
        }, null, 4)
        const exportData = new Blob([jsonData])
        const downloader = window.document.createElement("a")
        downloader.href = window.URL.createObjectURL(exportData);
        const now = new Date()
        downloader.download = now.toLocaleDateString("fr", { year: "numeric", month: "2-digit", day: "2-digit" }).split("/").reverse().join("") + "_" + now.getUTCHours().toString() + "Z" + now.getUTCMinutes().toString() + "_KrakenUsers_Export.json"
        document.body.appendChild(downloader)
        downloader.click()
        document.body.removeChild(downloader)
    }

    const purgeUser = async (userId?: string) => {
        if (purgeAction && purgeValidation == "Kraken/User") {
            await axios.delete("/api/users").catch((err) => {
                toast.clearWaitingQueue()
                toast.error("Something went wrong.", { containerId: "AdminContainer" })
            }).then((data) => {
                if (!isUndefined(data)) {
                    toast.clearWaitingQueue()
                    toast.success("DB purged.", { containerId: "AdminContainer" })
                    setPurgeAction(false)
                    setPurgeValidation("")
                    mutateUsers()
                }
            })
        } else if (!isUndefined(userId)) {
            await axios.delete("/api/users", { params: { userId: userId } }).catch((err) => {
                toast.clearWaitingQueue()
                toast.error("Something went wrong.", { containerId: "AdminContainer" })
            }).then((data) => {
                if (!isUndefined(data)) {
                    toast.clearWaitingQueue()
                    toast.success("Entry removed.", { containerId: "AdminContainer" })
                    setPurgeAction(false)
                    setPurgeValidation("")
                    mutateUsers()
                }
            })
        }
    }

    return (
        <AdminLayout pageName="users" >
            <div className="w-full h-fit max-h-full flex flex-col p-4 gap-4 rounded-md bg-slate-800">
                <div className="w-full flex flex-row items-center justify-between">
                    <div className="w-[30%] flex flex-row items-center gap-2 bg-slate-700 text-neutral-400 text-sm rounded-md p-1 px-2">
                        <MdSearch />
                        <input onChange={(e) => handleSearch(e)} type="text" className="bg-transparent text-white focus:outline-none w-full" placeholder="Search for user..." />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <div className="flex flex-row items-center gap-2 px-2 py-1 rounded-md bg-slate-600 border-2 border-slate-500 cursor-pointer hover:bg-slate-500 hover:border-slate-400 transition-all duration-300">
                            <MdSync />
                            Detect <span className="hidden lg:block">new media</span>
                        </div>
                        <div onClick={jsonExport} className="flex flex-row items-center gap-2 px-2 py-1 rounded-md bg-slate-600 border-2 border-slate-500 cursor-pointer hover:bg-slate-500 hover:border-slate-400 transition-all duration-300">
                            <TbDatabaseExport />
                            Export <span className="hidden lg:block">as JSON</span>
                        </div>
                        <div className="flex flex-row items-center gap-2 px-2 py-1 rounded-md bg-slate-600 border-2 border-slate-500 cursor-pointer hover:bg-slate-500 hover:border-slate-400 transition-all duration-300">
                            <TbDatabaseImport />
                            Import <span className="hidden lg:block">from JSON</span>
                        </div>
                    </div>
                </div>
                <div className="w-full h-[55vh] overflow-y-scroll overflow-x-clip">
                    <table className="w-full max-h-full table-fixed relative border-separate border-spacing-y-4">
                        <thead className="top-0 sticky bg-slate-800 w-full">
                            <tr className="text-white font-semibold ">
                                <td className="w-[35%]">Name</td>
                                <td className="w-[25%]">Email</td>
                                <td className="w-[15%] text-center">Created At</td>
                                <td className="w-[10%] text-center">Roles</td>
                                <td className="w-[15%]"></td>
                            </tr>
                        </thead>
                        <tbody className="w-full text-white overflow-y-scroll">
                            {(users || []).map((user: any) => (
                                <tr key={user?.id}>
                                    <td className="grid grid-cols-[20%_80%] items-center font-semibold truncate text-ellipsis">
                                        <img src={user.image || "/Assets/Images/default_profile.png"} className="max-h-6" alt="" />
                                        {user?.name}
                                    </td>
                                    <td className="font-light truncate text-ellipsis">
                                        {user?.email}
                                    </td>
                                    <td className="text-center text-slate-400 truncate text-ellipsis">
                                        {new Date(user?.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className={`${user?.roles == "admin" ? "text-red-500" : user?.roles == "user" ? "text-green-500" : "text-blue-500"} text-center truncate text-ellipsis`}>
                                        {user?.roles || "pending"}
                                    </td>
                                    <td className="flex flex-row items-center justify-center gap-2">
                                        <div onClick={() => router.push(`./users/edit/${user.id}`)} className="p-1 rounded-lg bg-slate-600 border-[1px] border-slate-400 hover:bg-blue-500 hover:border-blue-600 hover:text-white transition-all duration-300 cursor-pointer">
                                            <MdOutlineEdit />
                                        </div>
                                        <div onClick={() => { blockUser(user.id) }} className="p-1 rounded-lg bg-slate-600 border-[1px] border-slate-400 hover:bg-orange-500 hover:border-orange-600 hover:text-white transition-all duration-300 cursor-pointer">
                                            <MdBlock />
                                        </div>
                                        <div onClick={() => { purgeUser(user.id) }} className="p-1 rounded-lg bg-slate-600 border-[1px] border-slate-400 hover:bg-red-500 hover:border-red-600 hover:text-white transition-all duration-300 cursor-pointer">
                                            <HiOutlineTrash />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="w-full h-fit flex flex-row items-center justify-between px-4">
                    <button onClick={() => { mutateUsers() }} className="w-[15%] flex flex-row gap-2 group items-center justify-center p-1 px-2 rounded-md bg-purple-600 border-2 border-purple-700 text-sm hover:bg-purple-500 transition-all duration-100">
                        <MdRefresh className="hidden lg:block group-hover:animate-spin transition-all duration-300" size={18} />
                        Refresh
                    </button>
                    <button onClick={() => { setPurgeAction(true) }} className="w-[15%] flex flex-row gap-2 group items-center justify-center p-1 px-2 rounded-md bg-red-500 border-2 border-red-600 text-sm hover:bg-red-400 transition-all duration-100">
                        Purge <span className="hidden lg:block">database</span>
                    </button>
                </div>
            </div>
            <div onKeyDown={(e) => { if (e.key == "Escape") setPurgeAction(false) }} className={`${purgeAction ? "backdrop-blur-md bg-black" : "backdrop-blur-none transparent pointer-events-none"} absolute top-0 left-0 right-0 bottom-0 z-30 flex items-center bg-opacity-50 transition-all ease-in-out duration-200`}>
                <div className={`${purgeAction ? "visible" : "hidden"} absolute top-0 left-0 right-0 bottom-0 flex items-center`}>
                    <div onClick={() => setPurgeAction(false)} className="fixed top-0 left-0 right-0 bottom-0 z-40"></div>
                    <div className="w-[35%] h-fit flex flex-col gap-4 py-4 bg-slate-700 border-[1px] border-slate-400 text-slate-300 rounded-md m-auto  z-50">
                        <div className="w-full flex flex-row items-center justify-between px-4 ">
                            <div className="flex flex-col">
                                <p className="font-semibold text-xl">
                                    Purge User Database
                                </p>
                                <div className="flex flex-row items-center gap-2 text-xs font-light leading-none">
                                    <IoWarning className="text-orange-400" />
                                    This will remove every user except your current user.
                                </div>
                            </div>
                            <div onClick={() => setPurgeAction(false)} className="p-2 cursor-pointer hover:bg-slate-600 rounded-md transition-all duration-300">
                                <RxCross2 />
                            </div>
                        </div>
                        <hr className="border-[1px] border-slate-400" />
                        <div className="w-ful flex flex-col gap-2 items-center">
                            <div className="text-slate-400">
                                <BsDatabaseFillX size={30} />
                            </div>
                            <div className="text-2xl font-semibold">
                                Kraken/User
                            </div>
                            <div className="flex flex-row gap-2 items-center text-md font-light">
                                <MdGroups className="text-slate-400" size={20} />
                                {users?.length} entries
                            </div>
                        </div>
                        <hr className="border-[1px] border-slate-400" />
                        <div className="flex flex-col gap-2 px-4">
                            <p className="font-semibold">
                                To confirm, type &quot;Kraken/User&quot; in the box below
                            </p>
                            <input value={purgeValidation} onChange={(e) => setPurgeValidation(e.currentTarget.value)} type="text" className="rounded-md h-8 border-[1px] border-red-500 bg-slate-800 px-4 text-slate-300 font-semibold focus:outline-none" />
                        </div>
                        <div className="px-4">
                            <button onClick={() => purgeUser()} disabled={purgeValidation != "Kraken/User"} className="w-full text-red-500 font-semibold px-8 py-1 border-[1px] border-slate-500 disabled:opacity-50 disabled:hover:bg-slate-800 disabled:hover:text-red-500 disabled:hover:border-slate-500 hover:bg-red-500 hover:border-red-500 hover:text-white rounded-md bg-slate-800 transition-all duration-200">Puge this database</button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}