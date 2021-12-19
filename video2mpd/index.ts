/*
 * encode vp9 video for straming
 */


// ffmpeg VP9 encoding guide:
// http://wiki.webmproject.org/ffmpeg/vp9-encoding-guide
import {createManifest} from './createManifest'
import {encodeVP9} from './encodeVP9'
import { Scales } from './types';


interface Video2mpdI {
    encode: ()=>Promise<boolean>;
    createManifest:()=> Promise<void>;
}

export default class Video2mpd implements Video2mpdI {

    private file:string;
    private fileName:string;
    private scales:Scales;

    constructor(file: string, scales:Scales) {
        this.file = file
        this.fileName = file.split(".")[0]
        this.scales = scales

    }
    
    async encode() {
        const encoded = await encodeVP9(this.file,this.fileName, this.scales)
        return encoded
    }

    async createManifest() {
        await createManifest(this.fileName, this.scales)
    }



}
