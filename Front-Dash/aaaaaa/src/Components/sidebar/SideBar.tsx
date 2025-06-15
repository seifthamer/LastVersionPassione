import { useState, useEffect } from "react";
import { CDBSidebar, CDBSidebarHeader, CDBSidebarContent } from "cdbreact";
import { Nav } from "react-bootstrap";
import { IoIosFootball, IoMdSettings, IoIosArrowForward, IoIosArrowDown } from "react-icons/io";
import { TbPlayFootball } from "react-icons/tb";
import { MdQuiz, MdDashboard, MdGroup, MdOutlineSettingsSuggest, MdInfo, MdRule, MdPerson, MdPeople, MdSportsSoccer, MdEvent, MdImage, MdBusiness } from "react-icons/md";
import { HiMenuAlt2 } from "react-icons/hi";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { GrGallery } from "react-icons/gr";

interface SidebarWrapperProps {
  collapsed: boolean;
  textColor: string;
  backgroundColor: string;
  className?: string;
  breakpoint?: string;
  toggled?: boolean;
  minWidth?: string;
  maxWidth?: string;
}

interface IconProps {
  collapsed: boolean;
  isMobile: boolean;
}

interface OverlayProps {
  show: boolean;
  collapsed: boolean;
}

interface ToggleProps {
  collapsed: boolean;
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarWrapper = styled(CDBSidebar)<SidebarWrapperProps>`
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  transition: all 0.3s;
  width: ${(props) => (props.collapsed ? "80px" : "250px")} !important;
  min-width: ${(props) => (props.collapsed ? "80px" : "250px")} !important;
  z-index: 1000;
  background-color: ${(props) => props.backgroundColor};

  & * {
    box-sizing: border-box;
  }

  & .pro-sidebar {
    min-width: ${(props) => (props.collapsed ? "80px" : "250px")} !important;
    width: ${(props) => (props.collapsed ? "80px" : "250px")} !important;
  }

  @media (max-width: 768px) {
    .pro-sidebar {
      min-width: ${(props) => (props.collapsed ? "0" : "250px")} !important;
      width: ${(props) => (props.collapsed ? "0" : "250px")} !important;
    }
  }
`;

const SidebarHeaderWrapper = styled(CDBSidebarHeader)`
  padding: 15px;
  background: #2c3e50;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const ContentWrapper = styled(CDBSidebarContent)`
  padding-top: 10px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;

`;

const ListItem = styled.li`
  margin-bottom: 5px;
  width: 100%;
`;

const StyledNavLink = styled(Link)`
  display: flex;
  align-items: center;
  color: #f8f9fa;
  text-decoration: none;
  padding: 12px 16px;
  border-radius: 4px;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }

  &.active {
    background-color: #4e73df;
    color: white;
    font-weight: bold;
  }
`;

const Icon = styled.span<IconProps>`
  margin-right: ${(props) =>
    props.collapsed && !props.isMobile ? "0" : "12px"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 47px;
  min-width: 24px;
`;

const LinkText = styled.span<IconProps>`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: ${(props) =>
    props.collapsed && !props.isMobile ? "none" : "block"};
`;

const ToggleIcon = styled.div`
  cursor: pointer;
  font-size: 40px;
  display: flex;
  align-items: center;
  color: #f8f9fa;
  @media (max-width: 768px) {
    display: flex !important;
  }
`;

const MobileOverlay = styled.div<OverlayProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${(props) => (props.show && !props.collapsed ? "block" : "none")};

  // @media (min-width: 769px) {
  //   display: none;
  // }
`;

const MobileToggle = styled.div<ToggleProps>`
  position: fixed;
  top: 80px;
  left: 15px;
  z-index: 998;
  background-color: #2c3e50;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  display: none;
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);


`;

const SubMenu = styled.div<{ isOpen: boolean }>`
  max-height: ${props => props.isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
  background-color: rgba(0, 0, 0, 0.1);
`;

const SubMenuItem = styled(Link)`
  display: flex;
  align-items: center;
  color: #f8f9fa;
  text-decoration: none;
  padding: 8px 16px 8px 8px;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }

  &.active {
    background-color: #4e73df;
    color: white;
    font-weight: bold;
  }
`;

const ArrowIcon = styled.span<{ isOpen: boolean }>`
  margin-left: auto;
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'rotate(0deg)' : 'rotate(0deg)'};
  display: flex;
  align-items: center;
`;

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [gestionOpen, setGestionOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleGestion = () => setGestionOpen((prev) => !prev);

  return (
    <>
      <MobileOverlay show={isMobile && !collapsed} collapsed={collapsed} onClick={() => setCollapsed(true)} />
      <SidebarWrapper
        collapsed={collapsed}
        textColor="red"
        backgroundColor="#2c3e50"
        className="custom-sidebar"
        breakpoint="md"
        toggled={!collapsed}
        minWidth="80px"
        maxWidth="250px"
      >
        <SidebarHeaderWrapper>
          <ToggleIcon onClick={() => setCollapsed(!collapsed)}>
            <HiMenuAlt2 />
          </ToggleIcon>
        </SidebarHeaderWrapper>
        <ContentWrapper>
          <Nav className="w-100">
            <List>
              {[
                { to: "/", icon: <MdDashboard />, label: "Tableau D'Utilisateur" },
                { to: "/equipe", icon: <MdGroup />, label: "Équipe" },
                { to: "/match", icon: <IoIosFootball />, label: "Match" },
                { to: "/joueur", icon: <TbPlayFootball />, label: "Joueur" },
                { to: "/blog", icon: <IoMdSettings />, label: "Blog" },
                { to: "/galerie", icon: <GrGallery />, label: "Galerie" },
                {
                  to: "#",
                  icon: <MdOutlineSettingsSuggest />,
                  label: "Gestion",
                  onClick: toggleGestion,
                  subItems: [
                    {
                      to: "/gestion/about",
                      icon: <MdInfo />,
                      label: "À propos",
                    },
                    {
                      to: "/gestion/rules",
                      icon: <MdRule />,
                      label: "Règles du jeu",
                    },
                    {
                      to: "/gestion/terms",
                      icon: <MdPerson />,
                      label: "Condition d'utilisateur",
                    },
                  ],
                },
                { to: "/quiz", icon: <MdQuiz />, label: "Quiz" },
                { to: "/sponsors", icon: <MdBusiness />, label: "Sponsors" },
              ].map(({ to, icon, label, onClick, subItems }) => (
                <ListItem key={to}>
                  <StyledNavLink to={to} onClick={onClick}>
                    <Icon collapsed={collapsed} isMobile={isMobile}>
                      {icon}
                    </Icon>
                    <LinkText collapsed={collapsed} isMobile={isMobile}>
                      {label}
                    </LinkText>
                    {subItems && !collapsed && (
                      <ArrowIcon isOpen={gestionOpen}>
                        {gestionOpen ? (
                          <IoIosArrowDown />
                        ) : (
                          <IoIosArrowForward />
                        )}
                      </ArrowIcon>
                    )}
                  </StyledNavLink>
                  {subItems && !collapsed && (
                    <SubMenu isOpen={gestionOpen}>
                      {subItems.map((subItem) => (
                        <SubMenuItem key={subItem.to} to={subItem.to}>
                          <Icon collapsed={false} isMobile={false}>
                            {subItem.icon}
                          </Icon>
                          <LinkText collapsed={false} isMobile={false}>
                            {subItem.label}
                          </LinkText>
                        </SubMenuItem>
                      ))}
                    </SubMenu>
                  )}
                </ListItem>
              ))}
            </List>
          </Nav>
        </ContentWrapper>
      </SidebarWrapper>
    </>
  );
};

export default Sidebar;
