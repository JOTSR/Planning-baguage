import { JSX } from 'preact/jsx-runtime'

export function InputText(
	{ title, name, type, required, ...props }: {
		title: string
		name: string
		type:
			| 'text'
			| 'password'
			| 'email'
			| 'date'
			| 'time'
			| 'datetime-local'
			| 'number'
		required: boolean
	} & JSX.HTMLAttributes<HTMLInputElement>,
) {
	return (
		<label className='form-input' title={title}>
			<span className='form-input-label'>{title}</span>
			<input
				className='form-input-field'
				type={type}
				name={name}
				placeholder=' '
				required={required}
				{...props}
			/>
		</label>
	)
}
