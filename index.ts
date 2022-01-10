import { scales } from './config'
import Codec from './video2mpd'
const init = async () => {
    let video = new Codec("https://winggo-test-bucket.s3.eu-west-3.amazonaws.com/sample1.mp4", scales)

    await video.encode().then(()=>{
    video.createManifest()})

    // await video.encode();
    // await video.createManifest();
}
init()

// export {default as Codec} from './video2mpd'