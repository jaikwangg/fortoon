export type ImageType = 
    "storyCover" |
    "chapterImage" |
    "profilePicture"

export const setStandardImageName = (imageName: string , imageType: ImageType) => {
    const d = new Date()
    // Convert to Bangkok time (UTC+7) and create a timestamp
    const bangkokTime = new Date(d.getTime() + (7 * 60 * 60 * 1000))
    const timestamp = bangkokTime.toISOString().replace(/[:.]/g, '-')
    return `${imageType}-${imageName}-${timestamp}`
}