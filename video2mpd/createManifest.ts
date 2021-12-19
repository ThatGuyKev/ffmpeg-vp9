import util from 'util'
import format from 'string-template'
import shell from 'shelljs'
const exec = util.promisify(require('child_process').exec)

import { getVids, getMaps, getSets } from './utils'
import { CreateManifestI } from "./types";

const FFMPEG_BIN = shell.which('ffmpeg');

const MANIFEST_BASE = FFMPEG_BIN + ` \
{vids} \
-f webm_dash_manifest -i output/{fileName}/audio.webm  \
-c copy \
{maps} \
-f webm_dash_manifest \
-adaptation_sets {sets} \
 {output}`


export const createManifest: CreateManifestI = async (fileName, scales) => {
    if (!FFMPEG_BIN) {
        throw new Error(`FFmpeg not found`);
    }
    try {
        const args = {
            fileName,
            output: `output/${fileName}/${fileName}.mpd`,
            vids: getVids(fileName, scales),
            maps: getMaps(scales),
            sets: getSets(scales)
        };

        console.log(`Creating Manifest...`);

        const command = format(MANIFEST_BASE, args)
        const result = await exec(command);

        if (result.stderr) {
            throw new Error(`Creating Manifest failed: ${result.stderr}`);
        } else {
            console.info('Encoded successfully')
        }
    }
    catch (error) {
        throw new Error(error)
    }
}