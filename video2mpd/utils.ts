import { GetMapsI, GetSetsI, GetVidsI } from "./types"

export const getVids:GetVidsI = (fileName, scales) => {
    return scales.reduce((a, c) => a + ` \
    -f webm_dash_manifest -i output/${fileName}/${c.resolution.split(':').join("x")}-${c.rate}-${c.bitRate}k.webm `
        , "")
}
export const getMaps:GetMapsI = (scales) => {
    return scales.reduce((a, c, i) => a + ` -map ${i + 1}`
        , "-map 0")
}
export const getSets:GetSetsI = (scales) => {
    return scales.reduce((a, c, i) => (i + 1 == scales.length) ?
        a + `${i} id=1,streams=${scales.length}"`
        : a + `${i},`
        , `"id=0,streams=`)
}