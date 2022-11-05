import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { MdAddPhotoAlternate } from "react-icons/md";
import { ChatContext } from "../../context/chatContext";
import {
  arrayUnion,
  doc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import { Formik } from "formik";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { v4 as uuid } from "uuid";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import Message from "../message/Message";
import Bg from "../../assets/chatPanalbg.png";
import { BeatLoader } from "react-spinners";
import { signOut } from "firebase/auth";
import { RiLogoutCircleRLine } from "react-icons/ri";

const Container = styled.div`
  width: 100%;
  max-width: 650px;
`;
const Header = styled.div`
  background-color: #5f5b8f;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  background: #93a5e5;
`;
const Name = styled.span`
  font-family: monospace;
  font-size: ${(props) => (props.h ? "18px" : "16px")};
  color: white;
  padding: ${(props) => props.h && "5px 0"};
`;
const Icons = styled.div`
  display: flex;
  align-items: center;
  background-color: #2f2c53;
  color: white;
  font-family: cursive;
  font-size: 14px;
  padding: 6px 13px;
  grid-gap: 5px;
  border-radius: 22px;
  cursor: pointer;
  &:hover {
    transition: 0.2s;
    transform: scale(1.1);
  }
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
  min-width: 72px;
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
  font-size: 26px;
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
      if (vals.text || vals.image) {
        setLoading(true);
        if (vals.image !== "") {
          const name = new Date().getTime() + vals.image.name;
          const storageRef = ref(storage, name);
          const UploadTask = uploadBytesResumable(storageRef, vals.image);
          UploadTask.on(
            "state_changed",
            (snapShot) => {
              switch (snapShot.state) {
                case "paused":
                  // setLoading(true);
                  break;
                case "running":
                  // setLoading(true);
                  break;
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
                  setLoading(false);
                  toast.success("Message hase send successfully");
                  resetForm();
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
            setLoading(false);
            toast.success("Message hase send successfully");
            resetForm();
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
      } else {
        toast.error("please type an message");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };
  return (
    <Container>
      <Header>
        <Profile>
          {data?.chatId !== "null" ? (
            <>
              <Img src={data?.user?.photoURL} />
              <Name>{data?.user?.displayName}</Name>
            </>
          ) : (
            <Name h={true}>Please select someone to start chat</Name>
          )}
        </Profile>{" "}
        <Icons
          onClick={() => {
            signOut(auth);
          }}
        >
          <Icon>
            {" "}
            <RiLogoutCircleRLine />
          </Icon>{" "}
          LogOut
        </Icons>
      </Header>
      <Body bg={Bg}>
        {message.map((el, i) => (
          <Message data={el} img={data?.user?.photoURL} />
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
                disabled={data?.chatId === "null" || Loading}
              />{" "}
              <Input
                type="file"
                style={{ display: "none" }}
                ref={imgRef}
                onChange={(e) => {
                  if (
                    ["image/jpg", "image/png", "image/jpeg"].includes(
                      e.target.files[0].type
                    ) ||
                    ["video/mp4", "video/x-m4v", "video/*"].includes(
                      e.target.files[0]
                    )
                  ) {
                    setFieldValue("image", e.target.files[0]);
                  } else {
                    toast.error(
                      "Please Provide an valid image or video format"
                    );
                  }
                }}
                disabled={data?.chatId === "null" || Loading}
              />
              <UploadIcon
                style={{
                  cursor: data?.chatId === "null" || (Loading && "not-allowed"),
                  color: values.image && "#009687",
                }}
                title={values.image?.name}
              >
                <MdAddPhotoAlternate onClick={() => imgRef.current.click()} />
              </UploadIcon>
              <Button
                type="submit"
                disabled={data?.chatId === "null" || Loading}
              >
                {Loading ? <BeatLoader color="#000" size={10} /> : "Send"}
              </Button>
            </Footer>
          </form>
        )}
      </Formik>
    </Container>
  );
};

export default ChatPanal;
