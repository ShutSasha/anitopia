import React, { CSSProperties, FC, ReactNode, useEffect, useRef } from 'react'
import styles from './styles.module.scss'

type Props = {
   header_title: string
   children: ReactNode
   style?: CSSProperties
}

export const DynamicAnimeSection: FC<Props> = ({ header_title, children, style }) => {
   const childRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      if (React.Children.count(children) > 6 && childRef.current) {
         childRef.current.style.overflowY = 'scroll'
      }
   }, [children])

   return (
      <div style={{ ...style }} className={styles.wrapper}>
         <div className={styles.header_container}>
            <p className={styles.header_title}>{header_title}</p>
         </div>
         <div className={styles.children_section} ref={childRef}>
            {children}
         </div>
      </div>
   )
}
