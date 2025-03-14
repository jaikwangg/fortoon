import { dbConnection } from "@/db/dbConnector"
import { RowDataPacket } from "mysql2"

export const checkPostExisted = async (postId: number): Promise<boolean> => {
    console.assert(postId > 0)

    try {
        const [rs] = await dbConnection.execute<RowDataPacket[]>(`
        select *
        from Post
        where pId = ${postId}
    `)
        return rs.length > 0

    } catch (error) {
        console.error(error)
        return false
    }
}

export const countPostLikes = async (postId: number) => {
    console.assert(postId > 0)

    const isExisted = await checkPostExisted(postId)
    if (!isExisted) return 0

    try {
        const [rs] = await dbConnection.execute<RowDataPacket[]>(`
        select count(*) as countLike
        from PostInteraction pi
        where postId = ${postId}
    `)
    console.log(rs)

        return rs[0].countLike
    } catch (error) {
        console.error(error)
        return 0
    }
}