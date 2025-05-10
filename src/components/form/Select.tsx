import classNames from 'classnames'
import React, { useMemo } from 'react'

export interface SelectProps
  extends Omit<React.HTMLProps<HTMLSelectElement>, 'label'> {
  label?: React.ReactNode | string
  options: { id: string; name: string }[]
  onChange?: React.ChangeEventHandler<HTMLSelectElement>
}

const Select: React.FC<SelectProps> = (props) => {
  const selectProps = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const copy: any = { ...props }
    delete copy.label
    delete copy.options
    delete copy.className
    return copy as React.HTMLProps<HTMLSelectElement>
  }, [props])

  return (
    <label className='block text-sm font-medium mb-4'>
      {props.label != null && <span className='mb-1 block'>{props.label}</span>}
      <select
        {...selectProps}
        className={classNames(
          'w-full p-2 border border-foreground-light/75 rounded-md bg-background-light',
          props.className,
        )}
      >
        {props.options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  )
}

export default Select
