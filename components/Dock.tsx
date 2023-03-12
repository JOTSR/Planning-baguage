import NavIcon from './NavIcon.tsx'

export function Dock({ title }: { title: string }) {
	return (
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
	)
}
