import React from 'react'
import { ModeToggle } from './toggle-mode'

const NavBar = () => {
  return (
      <div className='border-b h-14 flex items-center justify-end px-4'>
        <ModeToggle />
      </div>
  )
}

export default NavBar
