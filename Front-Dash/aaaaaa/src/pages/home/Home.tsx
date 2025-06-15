import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../../Components/sidebar/SideBar';
import Navbar from '../../Components/navbar/Navbar';
import { useState } from 'react';

const HomeContainer = styled.div``;

const BodyContainer = styled.div`
  display: flex;
  flex: 1;
  height: 90vh;
`;
const ContainerR = styled.div`
  width: 100%;
  padding:2% 1% 0% 1%;
`;

const Home = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  return (
    <HomeContainer>
      <Navbar />
      <BodyContainer>
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <ContainerR>
          <Outlet />
        </ContainerR>
      </BodyContainer>
    </HomeContainer>
  );
};

export default Home;
// 
// 
// 
// 


// ****************************************