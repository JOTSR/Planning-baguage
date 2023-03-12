import { asset, Head } from '$fresh/runtime.ts'
import { AppProps } from '$fresh/server.ts'
import { Dock } from '../components/Dock.tsx'

const titles = {
	'/': 'Accueil',
	'/invite': 'Inviter',
	'/account': 'Compte',
	'/info': 'Info',
}

export default function App(
	{ Component }: AppProps,
) {
	const component = <Component />
	//@ts-ignore need to fix type
	const { pathname } = component.type().props.url as URL
	//@ts-ignore type guard by ternary
	const title = (pathname in titles) ? titles[pathname] : '404'

	return (
		<>
			<Head>
				<meta
					name='theme-color'
					content='#f3f2f1'
					media='(prefers-color-scheme: light)'
				/>
				<meta
					name='theme-color'
					content='#283319'
					media='(prefers-color-scheme: dark)'
				/>
				<meta
					name='description'
					content='Planing de baguage en Aquitaine'
				/>
				<link rel='stylesheet' href={asset('/style.css')} />
				<link rel='manifest' href={asset('/manifest.json')} />
				<link
					rel='shortcut icon'
					href={asset('/assets/icons/favicon.ico')}
					type='image/x-icon'
				/>
				<link
					rel='apple-touch-icon'
					href={asset('/assets/icons/logo-192.png')}
				/>
				<script src={asset('/app.js')} type='module' defer></script>
				<title>Planning baguage - {title}</title>
			</Head>
			<body>
				<main>
					<Component />
				</main>
				<Dock title={title} />
			</body>
		</>
	)
}
