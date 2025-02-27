import React from "react";
import { Link } from "react-router-dom";
import {
  Navbar as ReactstrapNavbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Container,
} from "reactstrap";
import { LoginButton, LogoutButton, Profile } from "./Auth";
import { useAuth0 } from "@auth0/auth0-react";
import yuo from '../assets/yuo.svg';
import youlingo from '../assets/youlingo.svg';

const Navbar = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <ReactstrapNavbar color="light" light expand="md" className="w-100">
      <Container className="d-flex justify-content-between align-items-center">
        <NavbarBrand href="/">
          <img src={yuo} alt="YouLingo Logo" style={{ height: '40px', marginRight: '10px' }} />
          <img src={youlingo} alt="YouLingo Logo" style={{ height: '50px', marginTop: '10px', marginRight: '10px' }} />
          {/* YouLingo */}
        </NavbarBrand>
        <Nav className="d-flex flex-row align-items-center" navbar>
          <NavItem>
            <NavLink tag={Link} to="/">
              Home
            </NavLink>
          </NavItem>
          {/* <NavItem>
            <NavLink tag={Link} to="/explore">
              Explore
            </NavLink>
          </NavItem> */}
          <NavItem>
            <NavLink tag={Link} to="/video_lesson">
              Video Lesson
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink tag={Link} to="/my_videos">
              My Videos
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink tag={Link} to="/settings">
              Settings
            </NavLink>
          </NavItem>
        </Nav>
        <div className="d-flex align-items-center">
          {isAuthenticated ? (
            <>
              <Profile />
              <LogoutButton />
            </>
          ) : (
            <LoginButton />
          )}
        </div>
      </Container>
    </ReactstrapNavbar>
  );
};

export default Navbar;
