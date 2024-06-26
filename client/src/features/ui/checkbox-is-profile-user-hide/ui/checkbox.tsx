import { CSSProperties, FC } from 'react'
import styles from './styles.module.scss'

interface CheckBoxProps {
   text: string
   style?: CSSProperties
}

export const CheckBox: FC<CheckBoxProps> = ({ text, style }) => {
   return (
      <div style={{ ...style }} className={styles.user_is_hide_profile}>
         <label>
            <input type='checkbox' />
            <div className={styles.checkbox_icon}></div>
            <p>{text}</p>
         </label>
      </div>
   )
}
