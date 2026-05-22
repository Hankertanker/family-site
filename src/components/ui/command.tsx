"use client"
import React from 'react'
export function Command(props: Record<string, any>) { return <>{props.children}</> }
export function CommandEmpty(props: Record<string, any>) { return <>{props.children}</> }
export function CommandGroup(props: Record<string, any>) { return <>{props.children}</> }
export function CommandInput(props: Record<string, any>) { return <input {...props} /> }
export function CommandItem(props: Record<string, any>) { return <div {...props} /> }
export function CommandList(props: Record<string, any>) { return <>{props.children}</> }
export function CommandSeparator(props: Record<string, any>) { return <hr /> }
export function CommandDialog(props: Record<string, any>) { return <>{props.children}</> }
