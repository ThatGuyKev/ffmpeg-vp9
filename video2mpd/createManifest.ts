import util from 'util'
import format from 'string-template'
import shell from 'shelljs'
const exec = util.promisify(require('child_process').exec)

import { getVids, getMaps, getSets } from './utils'
import { CreateManifestI } from "./types";

const FFMPEG_BIN = shell.which('ffmpeg');

const MANIFEST_BASE = FFMPEG_BIN + ` \
{vids} \
-f webm_dash_manifest -i /tmp/winggo-vod/{fileName}/audio.webm  \
{maps} \
-c copy \
-f webm_dash_manifest \
-adaptation_sets {sets} \
 {output}`


export const createManifest: CreateManifestI = async (fileName, scales) => {
    if (!FFMPEG_BIN) {
        throw new Error(`FFmpeg not found`);
    }

    try {
        // Change permissions
        // const CHANGE_PERMISSIONS = `cd ~/s3-bucket && chmod -R a+x ${fileName}`
        // const permissions = await exec(CHANGE_PERMISSIONS)
        const args = {
            fileName,
            output: `/tmp/winggo-vod/${fileName}/manifest.mpd`,
            vids: getVids(fileName, scales),
            maps: getMaps(scales),
            sets: getSets(scales)
        };

        console.log(`Creating Manifest...`);

        const command = format(MANIFEST_BASE, args)
        const result = await exec(command);

        if (result.stderr) {
            console.error(`Creating Manifest failed: ${result.stderr}`);
        } else {
            console.info('Encoded successfully')
        }

    }
    catch (error) {
        throw new Error(error)
    }
    // sudo s3fs winggo-test-bucket ~/s3-bucket -o use_cache=/tmp -o allow_other -o uid=1000 -o mp_umask=002 -o multireq_max=5 -o use_path_request_style -o url=https://s3-eu-wset-3.amazonaws.com

}