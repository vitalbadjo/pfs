import { getAuth, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Button } from "@mui/material"

export default function Login() {
	const auth = getAuth()
	const navigate = useNavigate()
	const [authing, setAuthing] = useState(false)
	const [user, setUser] = useState<User | null>(null)

	useEffect(() => {
		if (user?.uid) {
			navigate("/")
		} else {
			console.log("unauth")
		}
	}, [user, navigate])

	const signInWithGoogle = async () => {
		setAuthing(true)
		await signInWithPopup(auth, new GoogleAuthProvider()).then(e => {
			setUser(e.user)
		}).catch(e => {
			console.log(e)
			setAuthing(false)
		})
	}

	return <>
		Login
		<Button onClick={() => signInWithGoogle()} disabled={authing} variant="outlined">Sign in with google</Button>
	</>
}
