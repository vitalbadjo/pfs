import React from 'react';
import './App.scss';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./pages/login"
import { initializeApp } from "firebase/app"
import { config } from "./config/config"
import AuthRoute from "./auth-route"
import { ProjectsPage } from './pages/project-page/projects-page';
import { ProjectsRootPage } from './pages/project-page/projectsRoot';
import { NotFound } from './pages/not-found';

initializeApp(config.firebase)

export type IAppProps = {}

const App: React.FunctionComponent<IAppProps> = (props) => {
	return (<BrowserRouter>
		<Routes>
			<Route path={"/"} element={
				<AuthRoute>
					<NotFound />
				</AuthRoute>
			} />
			<Route path={"/projects"} element={
				<AuthRoute>
					<ProjectsRootPage />
				</AuthRoute>
			} />
			<Route path={"/projects/:id"} element={
				<AuthRoute>
					<ProjectsPage />
				</AuthRoute>
			} />
			{/* <Route path={"/settings/currencies"} element={
				<AuthRoute>
					<CurrenciesPage />
				</AuthRoute>
			} />
			<Route path={"/settings"} element={
				<AuthRoute>
					<SettingsPage />
				</AuthRoute>
			} /> */}
			<Route path={"/login"} element={<Login />} />
		</Routes>
	</BrowserRouter>);
}

export default App;
