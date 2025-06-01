import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../../Components/sidebar/SideBar';
import Navbar from '../../Components/navbar/Navbar';

const HomeContainer = styled.div`

`;

const BodyContainer = styled.div`
  display: flex;
  flex: 1;
  height: 90vh;
`;
const ContainerR = styled.div`
  width: 100%;

padding:2% 1% 0% 1%;

`
const Home = () => {
  return (
    <HomeContainer>
      <Navbar />
      <BodyContainer>
        <Sidebar />
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