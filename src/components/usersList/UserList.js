import { signOut } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { AuthContext } from "../../context/AuthContext";
import { auth, db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { ChatContext } from "../../context/chatContext";

const Container = styled.div`
  width: 100%;
  max-width: 350px;
  background-color: #3e3c62;
`;
const Header = styled.div`
  background-color: #2f2c53;
  position: sticky;
  top: 0;
  padding: 1.5rem 1rem;
`;
const Title = styled.p`
  font-family: cursive;
  color: white;
  font-size: 18px;
  margin: 0;
`;
const Img = styled.img`
  width: 100%;
  max-width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: fill;
`;
const Profile = styled.div`
  display: flex;
  align-items: center;
  grid-gap: 5px;
`;
const Name = styled.span`
  color: white;
  font-family: ${(props) => (props.user ? "sans-serif" : "monospace")};
  width: 100%;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const Button = styled.button`
  font-family: monospace;
  color: white;
  background-color: #5f5b8f;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  border-radius: 17px;
  border: 2px solid #5f5b8f;
  &:hover {
    transition: 0.4s;
    border: 2px solid #5f5b8f;
    background-color: transparent;
    border-radius: 17px;
  }
`;
const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const Input = styled.input`
  width: 100%;
  padding: 0.6rem 0.7rem;
  outline: none;
  background-color: #5f5b8f;
  border: none;
  border-radius: 17px;
  color: white;
  margin-top: 1rem;
  &::placeholder {
    color: #ccc;
  }
`;
const Body = styled.div`
  height: 100vh;
  max-height: 70vh;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #1d2a35;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #7489d9;
  }
`;
const User = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  grid-gap: 1rem;
  width: 100%;
  padding: 0.8rem;
  margin: 3px 0;
  cursor: pointer;
  border-bottom: 1px solid #add8e638;
  &:hover {
    background-color: ${(props) => (props.searched ? "#3e3c62" : "#2f2c53")};
  }
`;
const UserImg = styled.img`
  width: 50px;
  height: 50px;
  object-fit: fill;
  border-radius: 50%;
`;
const Message = styled.p`
  margin: 0;
  color: #ccc;
  font-size: 14px;
`;
const Box = styled.div``;
const UserList = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [userName, setUserName] = useState(null);
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const handleSearch = async () => {
    const q = query(
      collection(db, "users"),
      where("user_name", "==", userName)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.length === 0 && setUser(null);
    querySnapshot.forEach((doc) => {
      if (doc.data()?.uid === currentUser.uid) {
        setUser(null);
      } else {
        setUser(doc.data());
      }
    });
  };
  const handleKey = (e) => {
    e.key === "Enter" && handleSearch();
  };
  const handleSelect = async () => {
    const combineId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;
    try {
      const res = await getDoc(doc(db, "chats", combineId));
      if (!res.exists()) {
        alert("hey");
        await setDoc(doc(db, "chats", combineId), { messages: [] });
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combineId + ".userinfo"]: {
            uid: user.uid,
            displayName: user.user_name,
            photoURL: user.avatar,
          },
          [combineId + ".date"]: serverTimestamp(),
        });
        await updateDoc(doc(db, "userChats", user.uid), {
          [combineId + ".userinfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combineId + ".date"]: serverTimestamp(),
        });
        setUser(null);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };
  useEffect(() => {
    if (currentUser.uid) {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data());
      });
      return () => {
        unsub();
      };
    }
  }, []);
  const { dispatch } = useContext(ChatContext);
  const openChat = (u) => {
    dispatch({
      type: "CHANGE_USER",
      payload: u,
    });
  };
  return (
    <Container>
      <Header>
        <Wrapper>
          <Title>Jutt Chat&#9996;</Title>
          <Profile>
            <Img src={currentUser?.photoURL} />
            <Name title={currentUser?.displayName}>
              {currentUser?.displayName}
            </Name>
            <Button
              onClick={() => {
                signOut(auth);
              }}
            >
              LogOut
            </Button>
          </Profile>
        </Wrapper>
        <Input
          type="text"
          placeholder="Finds an chat"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyDown={handleKey}
        />
        {user && (
          <User searched={true} onClick={handleSelect}>
            <UserImg src={user?.avatar} />{" "}
            <Box>
              <Name user={true}>{user?.user_name}</Name>
            </Box>
          </User>
        )}
      </Header>
      <Body>
        {Object.entries(chats)
          ?.sort((a, b) => b[1]?.date - a[1]?.date)
          ?.map((el, i) => (
            <User key={i} onClick={() => openChat(el[1]?.userinfo)}>
              <UserImg src={el[1]?.userinfo?.photoURL} />{" "}
              <Box>
                <Name user={true}>{el[1]?.userinfo?.displayName}</Name>
                <Message>{el[1]?.lastMessage?.msg}</Message>
              </Box>
            </User>
          ))}
      </Body>
    </Container>
  );
};

export default UserList;
