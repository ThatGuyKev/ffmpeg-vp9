import { EncodeVP9I } from "./types"

const util = require('util')
const exec = util.promisify(require('child_process').exec)
const format = require('string-template')
const shell = require('shelljs')
const path = require('path')
const os = require('os')


const FFMPEG_BIN = shell.which('ffmpeg');
if (!FFMPEG_BIN) {
    throw new Error(`FFmpeg not found`);
}

const FFMPEG_TEMP = path.join(os.tmpdir(), 'ffmpeg2pass')
const FFMPEG_LOG = FFMPEG_TEMP + '-0.log';


const FFMPEG_VIDEO = FFMPEG_BIN + ` \
-hide_banner -i {input} -c:v libvpx-vp9 -row-mt 1 -keyint_min 150 \
-g 150 -tile-columns 4 -frame-parallel 1 \
-movflags faststart -f webm  -speed {speed} \
-threads 4 -an -vf scale={scale} -b:v {bitRate}k -r {rate} \
-f webm -dash 1 {output} `

const FFMPEG_AUDIO = FFMPEG_BIN + ` \
-hide_banner -i {input} -c:a libvorbis -b:a 192k -vn \
-f webm -dash 1 ~/s3-bucket/{fileName}/audio.webm`

const SPEED = 3
const MKDIR = `cd ~/s3-bucket && mkdir {fileName}`

export const encodeVP9: EncodeVP9I = async (file, fileName, scales) => {
    console.log(`FFmpeg pass 1:`, FFMPEG_LOG);
    try {
        await exec(format(MKDIR, { fileName }));
        
        let promises = []
        let command = format(FFMPEG_AUDIO, { input: file, fileName })

        // Execute audio codec
        promises.push(exec(command))

        scales.forEach((s, i) => {
            console.log("Position: ", i + 1, ", ", scales.length)
            let scale = s.resolution.split(":").join("x")
            let args = {
                input: `${file}`,
                fileName,
                rate: s.rate,
                speed: SPEED,
                output: `~/s3-bucket/${fileName}/${scale}-${s.rate}-${s.bitRate}k.webm`,
                scale: s.resolution,
                bitRate: s.bitRate
            }
            let command = format(FFMPEG_VIDEO, args)
            // Execute video codec
            promises.push(exec(command))

        })



        // console.log("promises", promises) 

        let results = await Promise.all(promises)

        console.log("results", results)
        return results ? true : false

    }
    catch (error) {
        throw new Error(error)
    }


}
