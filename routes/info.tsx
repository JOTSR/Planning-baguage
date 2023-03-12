import InstallPwaButton from '../islands/InstallPwaButton.tsx'
import { appVersion } from '../static/app_version.js'

export default function Info() {
	return (
		<>
			<h1>Informations</h1>
			<section>
				<h2>Présentation</h2>
				<p>Planning baguage v{appVersion}.</p>
				<h3>Contacts :</h3>
				<ul>
					<li>
						Pascal Zeddam{' '}
						<a href='tel:0641269486' target='_blank'>
							<i className='ti ti-phone'></i> Tel
						</a>{' '}
						<a href='mailto:zeddamp@wanadoo.fr' target='_blank'>
							<i className='ti ti-phone'></i> Mail
						</a>
					</li>
				</ul>
				<p>
					Ne vous inscrivez que si vous êtes sûr d'être disponible.
				</p>
				<p>
					Les liens d'invitation sont valables 90 jours.
				</p>
			</section>
			<section>
				<h2>Mentions légales</h2>
				<p>Aucune donnée personnelle n'est conservée.</p>
				<p>
					Tous droits réservés &copy;{' '}
					<a href='https://julienoculi.com' target='_blank'>
						Julien Oculi
					</a>{' '}
					2023.
				</p>
			</section>
			<InstallPwaButton>
				Installer l'application
			</InstallPwaButton>
		</>
	)
}
