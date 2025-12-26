"use client"

import React from 'react'

import { useLinkStatus } from 'next/link'
import { LoaderCircle } from 'lucide-react'

export function LinkStatus() {
  const { pending } = useLinkStatus()

  if (!pending) {
    return null
  }

  return (
    <span>
      <LoaderCircle className='size-4 animate-spin' />
    </span>
  )
}
