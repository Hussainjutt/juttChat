import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ChatPanal from "../../components/ChatPanal/ChatPanal";
import UserList from "../../components/usersList/UserList";
import { db } from "../../firebase";
const Home = () => {
  const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    margin: 2rem auto 0 auto;
    border-radius: 0.75rem;
    overflow: hidden;
    max-width: 1000px;
    box-shadow: 0px 0px 9px 2px rgba(0, 0, 0, 0.35);
    @media (max-width: 1050px) {
      margin: 2rem;
    }
    @media (max-width: 576px) {
      display: unset;
      margin: 0;
    }
  `;
  const [show, setShow] = useState(false);
  return (
    <Wrapper>
      <UserList setShow={setShow} className={show && "hide"} />
      <ChatPanal setShow={setShow} className={show && "show"} />
    </Wrapper>
  );
};

export default Home;
