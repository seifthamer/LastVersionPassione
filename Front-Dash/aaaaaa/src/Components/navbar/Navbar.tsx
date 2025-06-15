import React, { useState } from "react";
import styled from "styled-components";
import { FiSearch, FiSettings, FiBell, FiMenu, FiX } from "react-icons/fi";
import logo from "../../assets/logo.png";
import Picture from "../../assets/Picture.png";

interface RightSectionProps {
  isOpen: boolean;
}

interface OverlayProps {
  isOpen: boolean;
}

const NavbarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 15px 24px;
  background-color: #2c3e50;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  img {
    max-height: 40px;
    width: auto;
  }
`;

const RightSection = styled.div<RightSectionProps>`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    position: fixed;
    top: 64px;
    right: 0;
    flex-direction: column;
    background-color: #2c3e50;
    width: 250px;
    height: calc(100vh - 64px);
    padding: 20px;
    transform: ${({ isOpen }) =>
      isOpen ? "translateX(0)" : "translateX(100%)"};
    transition: transform 0.3s ease-in-out;
    z-index: 1000;
    align-items: flex-start;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  }
`;

const IconWrapper = styled.div`
  width: 36px;
  height: 36px;
  background-color: #f7f9fb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #e2e8f0;
  }

  svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 768px) {
    margin: 10px 0;
  }
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;

  @media (max-width: 768px) {
    margin: 10px 0;
  }
`;

const MobileMenuButton = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background-color: #f7f9fb;
    border-radius: 50%;
    cursor: pointer;
    margin-left: 10px;
    transition: background-color 0.2s ease;
    z-index: 2001;
    position: relative;
    &:hover {
      background-color: #e2e8f0;
    }
    svg {
      width: 20px;
      height: 20px;
      color: #2c3e50;
    }
  }
`;

const MobileMenuOverlay = styled.div<OverlayProps>`
  display: none;

  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? "block" : "none")};
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

const UserInfo = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    padding: 10px 0;
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    width: 100%;

    img {
      margin-right: 15px;
    }

    span {
      color: white;
      font-weight: 500;
    }
  }
`;

const Navbar: React.FC<{ setSidebarCollapsed?: (collapsed: boolean) => void }> = ({ setSidebarCollapsed }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <>
      <NavbarContainer>
        <LeftSection>
          <Logo>
            <img src={logo} alt="logo" />
          </Logo>
        </LeftSection>

        <MobileMenuButton onClick={() => setSidebarCollapsed && setSidebarCollapsed(false)}>
          <FiMenu />
        </MobileMenuButton>

        <RightSection isOpen={isMenuOpen}>
          <UserInfo>
            <Avatar src={Picture} alt="profile" />
            <span>User Name</span>
          </UserInfo>

          <IconWrapper>
            <FiSettings size={18} />
          </IconWrapper>

          <IconWrapper>
            <FiBell size={18} color="#f56565" />
          </IconWrapper>

          <Avatar src={Picture} alt="profile" />
        </RightSection>
      </NavbarContainer>

      <MobileMenuOverlay
        isOpen={isMenuOpen}
        onClick={() => setIsMenuOpen(false)}
      />
    </>
  );
};

export default Navbar;
