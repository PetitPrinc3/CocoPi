import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";
import fs from 'fs'
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { isNull, isUndefined } from "lodash";
import ffprobe from '@ffprobe-binary/ffprobe'

const genreIds: { [key: string]: string } = {
    "12": "Adventure",
    "14": "Fantasy",
    "16": "Animation",
    "18": "Drama",
    "27": "Horror",
    "28": "Action",
    "35": "Comedy",
    "36": "History",
    "37": "Western",
    "53": "Thriller",
    "80": "Crime",
    "99": "Documentary",
    "878": "Science Fiction",
    "9648": "Mystery",
    "10402": "Music",
    "10749": "Romance",
    "10751": "Family",
    "10752": "War",
    "10759": "Action & Adventure",
    "10762": "Kids",
    "10763": "News",
    "10764": "Reality",
    "10765": "Sci-Fi & Fantasy",
    "10766": "Soap",
    "10767": "Talk",
    "10768": "War & Politics",
    "10770": "TV Movie",
}

const getLanguage = (abv: string) => {
    switch (abv) {
        case "fre":
            return "french"
        case "fra":
            return "french"
        case "eng":
            return "english"
        case "ang":
            return "english"
        case "spa":
            return "spanish"
        case "por":
            return "portuguese"
        case "srp":
            return "serbian"
        case "jpn":
            return "japanese"
        case "ara":
            return "arabic"
        case "dan":
            return "danish"
        case "dut":
            return "dutch"
        case "est":
            return "estonian"
        case "fin":
            return "finnish"
        case "ger":
            return "german"
        case "hun":
            return "hungarian"
        case "ita":
            return "italian"
        case "rum":
            return "romanian"
        case "nor":
            return "norwegian"
        case "rus":
            return "russian"
        case "swe":
            return "swedish"
        case "tur":
            return "turkish"
        default:
            return ""
    }
}

function getInfo(file: string) {
    const spawn = require('child_process').spawnSync
    const { stdout: FFlanguages } = spawn(ffprobe, ['-loglevel', 'quiet', '-show_entries', 'stream=index:stream_tags=language', '-select_streams', 'a', '-of', 'compact=p=0:nk=1', file], { encoding: 'utf8' })

    const languages: string[] = []
    for (let _ of FFlanguages.split("\n")) {
        const abr = _.split("|")[1]
        if (!isUndefined(abr)) {
            const language = getLanguage(abr.trim())
            if (!languages.includes(language)) {
                languages.push(language)
            }
        }
    }

    const { stdout: FFsubtitles } = spawn(ffprobe, ['-loglevel', 'quiet', '-show_entries', 'stream=index:stream_tags=language', '-select_streams', 's', '-of', 'compact=p=0:nk=1', file], { encoding: 'utf8' })

    const subtitles: string[] = []
    for (let _ of FFsubtitles.split("\n")) {
        const abr = _.split("|")[1]
        if (!isUndefined(abr)) {
            const language = getLanguage(abr.trim())
            if (!subtitles.includes(language)) {
                subtitles.push(language)
            }
        }
    }

    const { stdout: FFduration } = spawn(ffprobe, ['-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file], { encoding: 'utf8' })

    const getDuration = () => {
        const duration = parseInt(FFduration)
        var d = Math.floor(duration / (3600 * 24));
        var h = Math.floor(duration % (3600 * 24) / 3600);
        var m = Math.floor(duration % 3600 / 60);
        var s = Math.floor(duration % 60);

        var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
        var hDisplay = h > 0 ? h + " h " : "";
        var mDisplay = m > 0 ? m + " min " : "";

        return dDisplay + hDisplay + mDisplay;
    }

    return {
        languages: languages.join(", "),
        subtitles: subtitles.join(", "),
        duration: getDuration()
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { currentUser }: any = await serverAuth(req, res);

    if (req.method == "GET") {

        const presentFiles: { key: string, name: string, title: string, type: string, languages?: string, subtitles?: string, path: string, seasons?: string }[] = []

        const existingMovies = await prismadb.media.findMany({
            where: {
                type: "Movies"
            }
        })

        const existingFiles: string[] = []

        for (let i = 0; i < existingMovies.length; i++) {
            existingFiles.push(existingMovies[i].videoUrl)
        }


        const filesList = fs.readdirSync("public/Assets/Movies", { withFileTypes: true })

        for (let i = 0; i < filesList.length; i++) {
            let title: string | null = null
            const keywords = filesList[i].name.split(".").join(" ").split("-").join(" ").split(" ")
            for (let word of keywords) {
                if (!(/\d/.test(word) && word.length > 2) && !["multi", "truefrench", "vff", "vfi", "vo", "hdlight", "4k", "webdrip", "mkv", "avi"].includes(word.toLowerCase())) {
                    title = title ? title + " " + word : word
                } else {
                    break
                }
            }
            if (!existingFiles.includes(`/Assets/Movies/${filesList[i].name}`)) {
                presentFiles.push({
                    key: uuidv4(),
                    name: filesList[i].name,
                    title: title?.toLowerCase() || "",
                    type: "Movies",
                    path: `/Assets/Movies/${filesList[i].name}`,

                })
            }
        }

        const existingSeries = await prismadb.media.findMany({
            where: {
                type: "Series"
            }
        })

        const existingFolders: string[] = []

        for (let i = 0; i < existingSeries.length; i++) {
            existingFiles.push((existingSeries[i].videoUrl.split("/")).splice(3, 1)[0])
        }

        fs.readdirSync("public/Assets/Series", { withFileTypes: true }).forEach((file) => {
            let title: string | null = null
            const keywords = file.name.split(".").join(" ").split("-").join(" ").split(" ")
            for (let word of keywords) {
                if (!(/\d/.test(word) && word.length > 2) && !["multi", "truefrench", "vff", "vfi", "vo", "hdlight", "4k", "webdrip", "mkv", "avi"].includes(word.toLowerCase())) {
                    title = title ? title + " " + word : word
                } else {
                    break
                }
            }
            if (!existingFiles.includes(file.name)) {
                const seasons: string[] = []
                fs.readdirSync(`public/Assets/Series/${file.name}`).forEach((season) => {
                    if (/SO*[0-9]*/.test(season)) {
                        seasons.push(season.split("SO").join("").split(" ").join(""))
                    }
                })
                presentFiles.push({
                    key: uuidv4(),
                    name: file.name,
                    title: title?.toLowerCase() || "",
                    type: "TV Show",
                    path: `/Assets/Series/${file.name}`,
                    seasons: seasons.sort().join(",")
                })
            }
        })

        return res.status(200).json(presentFiles)



    }

    if (req.method == "POST") {

        const files = req.body
        const movies: any[] = []

        for (let i = 0; i < files.length; i++) {
            const url = files[i].type == "Movies" ? `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_SECRET}&query=${files[i].title}&include_adult=true&language=en-US&page=1` : `https://api.themoviedb.org/3/search/tv?api_key=${process.env.TMDB_API_SECRET}&query=${files[i].title}&include_adult=true&language=en-US&page=1`;
            const { data: apiResult } = await axios.get(url)

            if (!isUndefined(apiResult?.results[0])) {
                const posterUrl = `http://image.tmdb.org/t/p/w500${apiResult.results[0]?.backdrop_path}`
                const thumbUrl = `http://image.tmdb.org/t/p/w500${apiResult.results[0]?.poster_path}`
                const movieGenres: any[] = []
                apiResult.results[0]?.genre_ids.forEach((genre: string) => {
                    if (genreIds.hasOwnProperty(genre)) {
                        movieGenres.push(genreIds[genre])
                    }
                });

                const movieInfo = getInfo(`public${files[i].path}`)

                const initMovie = await prismadb.media.create({
                    data: {
                        title: files[i].type == "Movies" ? apiResult.results[0].original_title : apiResult.results[0].original_name,
                        altTitle: files[i].title,
                        type: files[i].type,
                        description: apiResult.results[0].overview,
                        videoUrl: files[i].path,
                        thumbUrl: thumbUrl,
                        posterUrl: posterUrl,
                        genre: movieGenres.join(", "),
                        uploadedBy: currentUser.email,
                        languages: movieInfo.languages,
                        subtitles: movieInfo.subtitles,
                        duration: movieInfo.duration
                    }
                })

                fs.mkdir(`public/Assets/Images/${initMovie.id}`, (err) => { })

                const poster = await (await fetch(posterUrl)).blob()
                fs.writeFile(`public/Assets/Images/${initMovie.id}${apiResult.results[0]?.backdrop_path}`, Buffer.from(await poster.arrayBuffer()), (err) => { })

                const thumb = await (await fetch(thumbUrl)).blob()
                fs.writeFile(`public/Assets/Images/${initMovie.id}${apiResult.results[0]?.poster_path}`, Buffer.from(await thumb.arrayBuffer()), (err) => { })

                const finalMovie = await prismadb.media.update({
                    where: {
                        id: initMovie.id
                    },
                    data: {
                        thumbUrl: `/Assets/Images/${initMovie.id}${apiResult.results[0]?.poster_path}`,
                        posterUrl: `/Assets/Images/${initMovie.id}${apiResult.results[0]?.backdrop_path}`,
                    }
                })

                movies.push(finalMovie)
            } else {
                return res.status(400).json("Title not found")
            }


        }

        return res.status(200).json(movies)
    }


}