"use client"

import React from 'react'
import { Button as AntButton, ConfigProvider } from 'antd'
import Link from 'next/link'

interface ButtonProps {
  children?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLElement>
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text'
  htmlType?: 'button' | 'submit' | 'reset'
  variant?: string
  size?: 'small' | 'middle' | 'large' | 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  href?: string
  className?: string
  danger?: boolean
  style?: React.CSSProperties
}

function Button(props: ButtonProps) {
  const { variant, type, htmlType, className, children, loading, disabled, href, onClick, danger, size: sz, style, ...rest } = props

  let antdType: 'primary' | 'default' | 'dashed' | 'link' | 'text' = 'default'
  let antdDanger = false
  if (variant === 'primary' || variant === undefined) antdType = 'primary'
  else if (variant === 'danger') { antdType = 'primary'; antdDanger = true }
  else if (variant === 'link') antdType = 'link'
  else antdType = type || 'default'

  // Map size
  let antdSize: 'small' | 'middle' | 'large' | undefined = undefined
  if (sz === 'sm' || sz === 'small') antdSize = 'small'
  else if (sz === 'lg' || sz === 'large') antdSize = 'large'
  else antdSize = 'middle'

  const btnProps = {
    type: antdType,
    danger: antdDanger,
    htmlType: htmlType as 'button' | 'submit' | 'reset' | undefined,
    className,
    loading,
    disabled: disabled || loading,
    onClick,
    size: antdSize,
    style,
  }

  const btn = (
    <AntButton {...(btnProps as any)}>
      {children}
    </AntButton>
  )

  if (href) {
    return <Link href={href}>{btn}</Link>
  }

  return (
    <ConfigProvider
      theme={{
        token: { borderRadius: 12, colorPrimary: '#3b82f6' },
      }}
    >
      {btn}
    </ConfigProvider>
  )
}

export default Button
export { Button }
