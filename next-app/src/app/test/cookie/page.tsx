import { cookies } from 'next/headers'

export default function Page() {
    const cookieStore = cookies()

    // useEffect(() => {
    //     console.log("hello")
    //     console.log(cookieStore.get("token"))
    // }, [])

    return cookieStore.getAll().map((cookie) => (
        <div key={cookie.name}>
            <p>Name: {cookie.name}</p>
            <p>Value: {cookie.value}</p>
        </div>
    ))
}