import { asset, Head } from '$fresh/runtime.ts'
import { JSX } from 'preact/jsx-runtime'
import NavIcon from './NavIcon.tsx'

export default function Skeleton(
	{ title, children }: { title: string; children: JSX.Element },
) {
	return (
		<>
			<Head>
				<meta
					name='theme-color'
					content='#dbe6cc'
					media='(prefers-color-scheme: light)'
				/>
				<meta
					name='theme-color'
					content='#283319'
					media='(prefers-color-scheme: dark)'
				/>
				<link rel='stylesheet' href={asset('/style.css')} />
				<link rel="manifest" href={asset('/manifest.json')} />
				<link rel="shortcut icon" href={asset('/assets/icons/favicon.ico')} type="image/x-icon" />
				<title>Planning baguage - {title}</title>
			</Head>
			<body>
				<main>{children}</main>
				<nav className='dock'>
					<NavIcon
						title='Accueil'
						picto='home'
						href='/'
						currentTab={title}
					/>
					<NavIcon
						title='Inviter'
						picto='square-rounded-plus'
						href='/invite'
						currentTab={title}
					/>
					<NavIcon
						title='Compte'
						picto='lock-square-rounded'
						href='/account'
						currentTab={title}
					/>
					<NavIcon
						title='Info'
						picto='info-square-rounded'
						href='/info'
						currentTab={title}
					/>
				</nav>
			</body>
		</>
	)
}
