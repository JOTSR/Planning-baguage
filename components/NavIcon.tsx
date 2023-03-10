export default function NavIcon(
	{ title, picto, href, currentTab }: {
		title: string
		picto: string
		href: string
		currentTab: string
	},
) {
	const isActive = currentTab === title
	return (
		<>
			<a
				href={href}
				className={`nav_icon ${isActive ? 'nav_icon-active' : ''}`}
			>
				<i className={`ti ti-${picto}`}></i>
				<span>{title}</span>
			</a>
		</>
	)
}
