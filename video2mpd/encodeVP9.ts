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
-threads 8 -an -vf scale={scale} -b:v {bitRate}k -r {rate} \
-f webm -dash 1 {output} `

const FFMPEG_AUDIO = FFMPEG_BIN + ` \
-hide_banner -i {input} -c:a libvorbis -b:a 192k -vn \
-f webm -dash 1 output/{fileName}/audio.webm`

const SPEED = 4
const MKDIR = `cd output && mkdir {fileName} && cd ..`

export const encodeVP9: EncodeVP9I = async (file, fileName, scales) => {
    console.log(`FFmpeg pass 1:`, FFMPEG_LOG);
    try {
        await exec(format(MKDIR, { fileName }));
        return new Promise((resolve, reject) => {
            scales.forEach(async (s, i) => {
                let scale = s.resolution.split(":").join("x")
                let args = {
                    input: `input/${file}`,
                    fileName,
                    rate: s.rate,
                    speed: SPEED,
                    output: `output/${fileName}/${scale}-${s.rate}-${s.bitRate}k.webm`,
                    scale: s.resolution,
                    bitRate: s.bitRate
                }

                let command = format(FFMPEG_VIDEO, args)
                 await exec(command);
                if (i + 1 == scales.length) {
                let command = format(FFMPEG_AUDIO, args)
                let result = await exec(command);
                    resolve(result ? true : false)
                }
            })
        })
    }
    catch (error) {
        throw new Error(error)
    }


}
