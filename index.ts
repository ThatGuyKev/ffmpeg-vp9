import { scales } from './config'
import Codec from './video2mpd'
const init = async () => {
    let video = new Codec("sample.mp4", scales)

    await video.encode().then(()=>{
    video.createManifest()})
}
init()