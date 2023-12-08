import React from 'react';
import './App.scss';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from "./pages/dashboard"
import Login from "./pages/login"
import { initializeApp } from "firebase/app"
import { config } from "./config/config"
import AuthRoute from "./components/auth-route"
import SettingsPage from "./pages/settings/settings"
import CurrenciesPage from "./pages/settings/currencies"
import { ProjectsPage } from './pages/project-page/projects-page';

initializeApp(config.firebase)

export type IAppProps = {}

const App: React.FunctionComponent<IAppProps> = (props) => {
	return (<BrowserRouter>
		<Routes>
			<Route path={"/"} element={
				<AuthRoute>
					<Dashboard />
				</AuthRoute>
			} />
			<Route path={"/projects/:id"} element={
				<AuthRoute>
					<ProjectsPage />
				</AuthRoute>
			} />
			<Route path={"/projects"} element={
				<AuthRoute>
					<ProjectsPage />
				</AuthRoute>
			} />
			<Route path={"/settings/currencies"} element={
				<AuthRoute>
					<CurrenciesPage />
				</AuthRoute>
			} />
			<Route path={"/settings"} element={
				<AuthRoute>
					<SettingsPage />
				</AuthRoute>
			} />
			<Route path={"/login"} element={<Login />} />
		</Routes>
	</BrowserRouter>);
}

export default App;
