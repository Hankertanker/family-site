"use client"
import React from 'react'

export function Dialog(props: Record<string, any>) { return <>{props.open !== false ? props.children : null}</> }
export function DialogContent(props: Record<string, any>) { return <div className={props.className}>{props.children}</div> }
export function DialogHeader(props: Record<string, any>) { return <div className={props.className}>{props.children}</div> }
export function DialogTitle(props: Record<string, any>) { return <h2 className={props.className}>{props.children}</h2> }
export function DialogDescription(props: Record<string, any>) { return <p>{props.children}</p> }
export function DialogClose(props: Record<string, any>) { return <div className={props.className}>{props.children}</div> }
export function DialogOverlay(props: Record<string, any>) { return <>{props.children}</> }
export function DialogPortal(props: Record<string, any>) { return <>{props.children}</> }
export function DialogTrigger(props: Record<string, any>) { return <>{props.children}</> }
