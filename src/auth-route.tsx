import React, { PropsWithChildren, useEffect, useState } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import initUser from "./services/init-user"
import { UserProvider } from "./providers/userProvider"
import PageContainer from "./pages/page-container"
import { LoadingOutlined } from "@ant-design/icons"
import { Spin } from "antd"

export type IAuthRouteProps = {}

const AuthRoute: React.FunctionComponent<IAuthRouteProps & PropsWithChildren> = (props) => {
	const { children } = props
	const auth = getAuth()
	const navigate = useNavigate()
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const authCheck = onAuthStateChanged(auth, (user) => {
			if (user) {

				initUser().then(() => {
					console.log("initializing User")
				}).catch(() => {
					console.log("error user initialization")
				})
				setLoading(false)
			} else {
				console.log("unauthorized")
				navigate('/login')
			}
		})
		return () => authCheck()
	}, [auth, navigate])

	if (loading) {
		return <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="Loading" fullscreen />
	}
	return <UserProvider>
		<PageContainer>
			{children}
		</PageContainer>
	</UserProvider>
}

export default AuthRoute
