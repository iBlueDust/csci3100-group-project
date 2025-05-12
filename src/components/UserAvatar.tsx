import React from 'react'

export interface UserAvatarProps {
  username: string
}

const UserAvatar: React.FC<UserAvatarProps> = ({ username }) => {
  return (
    <div className='flex size-8 items-center justify-center rounded-full bg-foreground/10'>
      <span className='font-bold'>{username.charAt(0).toUpperCase()}</span>
    </div>
  )
}

export default UserAvatar
