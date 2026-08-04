import React from 'react'
import GustUserHeader from './gustuserheader'
import { Outlet } from 'react-router-dom'
import GustFooter from './GustFooter'

export default function GuestLayout() {
    return (
        <>
            <GustUserHeader />
            <Outlet />
            <GustFooter />
        </>
    )
}

