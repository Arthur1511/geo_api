import { FaBars } from 'react-icons/fa'
import { Link } from 'react-router-dom';
import { AiOutlineClose } from 'react-icons/ai'
import React, { useState } from 'react'
import { NavbarData } from './data'
import './styles.css'

function Navbar() {
    const [sidebar, setSidebar] = useState(false)
    const showSidebar = () => setSidebar(!sidebar)

    return (
        <div className="nav-menu-container" >
            <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
                <ul className='nav-menu-items'>
                    {/* <li className="nav-bar-toggle">
                        <Link to="#" className="menu-bars">
                            <AiOutlineClose />
                        </Link>
                    </li> */}
                    {NavbarData.map((item, index) => {
                        return (
                            <li key={index} className={item.className}>
                                <Link to={item.path}>
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

        </div >

    )
}

export default Navbar