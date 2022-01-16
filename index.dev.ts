import { scales } from './config'
import Codec from './video2mpd'
import {syncS3} from './video2mpd/syncS3'
const init = async () => {
    let video = new Codec("https://winggo-test-bucket.s3.eu-west-3.amazonaws.com/sample1.mp4", scales)

    await video.encode().then((encoded) => {
        if (encoded) {
            video.createManifest().then((manifest) => {
                syncS3()
            })
        }
    })



}
init()
