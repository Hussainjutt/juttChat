import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { IoIosVideocam } from "react-icons/io";
import { HiOutlineLink } from "react-icons/hi";
import { ImUserPlus } from "react-icons/im";
import { MdAddPhotoAlternate } from "react-icons/md";
import { SlOptionsVertical } from "react-icons/sl";
import { ChatContext } from "../../context/chatContext";
import {
  arrayUnion,
  doc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../firebase";
import { Formik } from "formik";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { v4 as uuid } from "uuid";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import Message from "../message/Message";
import Bg from "../../assets/chatPanalbg.png";

const Container = styled.div`
  width: 100%;
  max-width: 650px;
`;
const Header = styled.div`
  background-color: #5f5b8f;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: end;
`;
const Body = styled.div`
  height: 100vh;
  max-height: 70vh;
  overflow-y: auto;
  background: url(${(props) => props.bg}) #dddcf7;
  background-size: cover;
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
const Footer = styled.div`
  background-color: #fff;
  width: 100%;
  padding: 1rem;
  display: flex;
  align-items: center;
  grid-gap: 13px;
`;
const Profile = styled.div`
  display: flex;
  align-items: center;
  grid-gap: 0.6rem;
`;
const Img = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: fill;
`;
const Name = styled.span`
  font-family: monospace;
  font-size: 16px;
  color: white;
`;
const Icons = styled.div`
  display: flex;
  align-items: center;
  grid-gap: 12px;
`;
const Icon = styled.span`
  color: #dddcf7;
  cursor: pointer;
`;
const Input = styled.input`
  width: 100%;
  font-size: 17px;
  resize: none;
  border: none;
  outline: none;
  &::placeholder {
    color: #ccc;
  }
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
    color: #5f5b8f;
  }
`;
const UploadIcon = styled.span`
  color: gray;
  font-size: 20px;
  cursor: pointer;
`;
const ChatPanal = ({ setLastMessage }) => {
  const { data } = useContext(ChatContext);
  const [message, setMessage] = useState([]);
  const [Loading, setLoading] = useState(false);
  const imgRef = useRef();
  const { currentUser } = useContext(AuthContext);
  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", data?.chatId), (doc) => {
      if (doc.exists()) {
        setMessage(doc.data().messages);
      }
    });
    return () => {
      unSub();
    };
  }, [data?.chatId]);
  const sendText = async (vals, resetForm) => {
    try {
      if (vals.image !== "") {
        const name = new Date().getTime() + vals.image.name;
        const storageRef = ref(storage, name);
        const UploadTask = uploadBytesResumable(storageRef, vals.image);
        UploadTask.on(
          "state_changed",
          (snapShot) => {
            switch (snapShot.state) {
              case "paused":
                setLoading(true);
                break;
              case "running":
                setLoading(true);
                break;
            }
            let progress =
              (snapShot.bytesTransferred / snapShot.totalBytes) * 100;
            if (progress !== null && progress < 100) {
              setLoading(true);
            } else {
              setLoading(false);
            }
          },
          (errors) => {
            console.error(errors);
          },
          () => {
            getDownloadURL(UploadTask.snapshot.ref).then((res) => {
              updateDoc(doc(db, "chats", data?.chatId), {
                messages: arrayUnion({
                  id: uuid(),
                  text: vals.text,
                  image: res,
                  date: Timestamp.now(),
                  senderId: currentUser?.uid,
                }),
              }).then((res) => {
                resetForm();
                toast.success("Message send scus");
              });
            });
          }
        );
      } else {
        updateDoc(doc(db, "chats", data?.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text: vals.text,
            date: Timestamp.now(),
            senderId: currentUser?.uid,
          }),
        }).then((res) => {
          resetForm();
          toast.success("Message send scus");
        });
      }
      let msg = vals?.text;
      await updateDoc(doc(db, "userChats", currentUser?.uid), {
        [data?.chatId + ".lastMessage"]: {
          msg,
        },
        [data?.chatId + ".date"]: serverTimestamp(),
      });
      await updateDoc(doc(db, "userChats", data?.user?.uid), {
        [data?.chatId + ".lastMessage"]: {
          msg,
        },
        [data?.chatId + ".date"]: serverTimestamp(),
      });
    } catch (err) {
      toast.error(err.message);
    }
  };
  return (
    <Container>
      <Header>
        {data?.chatId !== "null" ? (
          <>
            <Profile>
              <Img src={data?.user?.photoURL} />
              <Name>{data?.user?.displayName}</Name>
            </Profile>{" "}
            <Icons>
              <Icon style={{ fontSize: "25px" }}>
                <IoIosVideocam />
              </Icon>
              <Icon style={{ fontSize: "20px" }}>
                <ImUserPlus />
              </Icon>
              <Icon>
                <SlOptionsVertical />
              </Icon>
            </Icons>
          </>
        ) : (
          <p
            style={{
              fontFamily: "cursive",
              fontWeight: "bold",
              color: "white",
            }}
          >
            Please Select someone to start chat
          </p>
        )}
      </Header>
      <Body bg={Bg}>
        {message.map((el, i) => (
          <Message data={el} />
        ))}
      </Body>
      <Formik
        initialValues={{
          image: "",
          text: "",
        }}
        onSubmit={(values, { resetForm }) => {
          sendText(values, resetForm);
        }}
      >
        {({ handleChange, handleSubmit, setFieldValue, values }) => (
          <form onSubmit={handleSubmit}>
            <Footer>
              <Input
                type="text"
                placeholder="Type your message here"
                name="text"
                onChange={handleChange}
                value={values.text}
                disabled={data?.chatId === "null"}
              />{" "}
              <Input
                type="file"
                style={{ display: "none" }}
                ref={imgRef}
                onChange={(e) => {
                  setFieldValue("image", e.target.files[0]);
                }}
                disabled={data?.chatId === "null"}
              />
              <UploadIcon>
                <MdAddPhotoAlternate onClick={() => imgRef.current.click()} />
              </UploadIcon>
              <Button type="submit" disabled={data?.chatId === "null"}>
                Send
              </Button>
            </Footer>
          </form>
        )}
      </Formik>
    </Container>
  );
};

export default ChatPanal;
