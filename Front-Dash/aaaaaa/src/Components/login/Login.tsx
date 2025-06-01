
import styled, { createGlobalStyle } from "styled-components";
import { FiMail, FiLock } from "react-icons/fi";
import Picture from "../../assets/Picture.png"; 
import React, { useState } from "react";
import  useAuthStore  from "../../Store/authStore";
import { useNavigate } from "react-router-dom"; 
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  body, html, #root {
    height: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }
`;
const Container = styled.div`
  display: flex;
  height: 100%;
  @media (max-width: 767px) {
    flex-direction: column;

      }
`;

const LeftPanel = styled.div`
  img {
    height: 100%;
    object-fit: cover;
  }
  @media (max-width: 1024px) {
    flex: 1;
    img {
    width: 100%;
      height: 100%;
      object-fit: cover;
    }
        @media (max-width: 767px) {
      flex: none;

    img {
display: none;
    }
  }
`;




// Right login panel
const RightPanel = styled.div`
  flex: 1;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormWrapper = styled.div`
  max-width: 400px;
  width: 100%;
  @media (max-width: 768px) {
    max-width: 80%;
  }
`;

const Title = styled.h2`
  font-weight: 700;
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  color: #555;
  margin-bottom: 30px;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 40px;
  border-radius: 999px;
  border: 1px solid #e0e0e0;
  background: #f9f9f9;
  font-size: 14px;
  outline: none;
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  color: #999;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 999px;
  background-color: #629f3f;
  color: white;
  font-weight: bold;
  margin-top: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
  &:hover {
    background-color:rgb(62, 130, 22);
  }
`;

const ForgotPassword = styled.p`
  text-align: center;
  margin-top: 12px;
  font-size: 13px;
  color: #777;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

// Main component
const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // ⬅️ Init navigation hook

  const handleLogin = async () => {
    await login(username, password);
    if (useAuthStore.getState().user) {
      navigate("/"); // ⬅️ Redirect to dashboard route ("/" goes to <Dashboard /> via index route)
    }
  };
  return (
    <>
      <GlobalStyle />
      <Container>
        <LeftPanel>
          <img src={Picture} alt="" />
        </LeftPanel>
        <RightPanel>
          <FormWrapper>
            <Title>Hello Again!</Title>
            <Subtitle>Welcome Back</Subtitle>
            <InputGroup>
              <IconWrapper>
                <FiMail />
              </IconWrapper>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </InputGroup>
            <InputGroup>
              <IconWrapper>
                <FiLock />
              </IconWrapper>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </InputGroup>
            <Button onClick={handleLogin} disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <ForgotPassword>Forgot Password</ForgotPassword>
          </FormWrapper>
        </RightPanel>
      </Container>
    </>
  );
};

export default LoginPage;
