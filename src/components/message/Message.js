import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AuthContext } from "../../context/AuthContext";

const Container = styled.div`
  display: flex;
  justify-content: ${(props) => (props?.isLeft ? "start" : "flex-end")};
  align-items: ${(props) => (props.haveText ? "baseline" : "flex-start")};
  padding: 1rem;
  grid-gap: 0.5rem;
  flex-direction: ${(props) => props?.isLeft && "row-reverse"};
`;
const Text = styled.span`
  background-color: ${(props) => (props.isLeft ? "white" : "#889ffd")};
  color: ${(props) => (props.isLeft ? "black" : "white")};
  padding: 5px 11px;
  border-radius: ${(props) =>
    props.isLeft ? "0px 10px 0px 10px" : "10px 0px 10px 0px"};
  word-wrap: break-word;
  max-width: 200px;
`;
const Img = styled.img`
  width: 100%;
  max-width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: fill;
  background: #93a5e5;
`;
const ImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isLeft ? "flex-start" : "end")};
  justify-content: flex-end;
`;
const Time = styled.small`
  font-family: monospace;
`;
const Prev = styled.img`
  width: 150px;
  max-height: 150px;
  border: 1px solid #5f5b8f;
  border-radius: 9px;
  cursor: pointer;
`;
const VideoPrev = styled.video`
  width: 200px;
  height: 160px;
  object-fit: cover;
  border: 1px solid #5f5b8f;
  border-radius: 9px;
`;
const Message = ({ data, img }) => {
  const { currentUser } = useContext(AuthContext);
  const isLeft = data?.senderId === currentUser?.uid ? false : true;
  const imgRef = useRef();
  const [error, setError] = useState(false);
  function formatAMPM(d) {
    var date = new Date(); // Epoch
    date.setSeconds(d);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var strTime = hours + ":" + minutes;
    return strTime;
  }
  let date = formatAMPM(data?.date?.seconds);
  const scrollRef = useRef();
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);
  return (
    <Container isLeft={isLeft} ref={scrollRef} haveText={data?.text}>
      <ImageWrapper style={{ gridGap: data?.image && "1rem" }} isLeft={isLeft}>
        {data?.text && <Text isLeft={isLeft}>{data?.text}</Text>}
        {data?.image && (
          <>
            {error ? (
              <VideoPrev onError={() => setError(false)} controls>
                <source src={data?.image} />
              </VideoPrev>
            ) : (
              <Prev
                src={data?.image}
                onError={() => setError(true)}
                onClick={() => {
                  if (imgRef.current.requestFullscreen) {
                    imgRef.current.requestFullscreen();
                  } else if (imgRef.current.webkitRequestFullscreen) {
                    imgRef.current.webkitRequestFullscreen();
                  } else if (imgRef.current.msRequestFullscreen) {
                    imgRef.current.msRequestFullscreen();
                  }
                }}
                ref={imgRef}
              />
            )}
          </>
        )}
      </ImageWrapper>
      <ImageWrapper>
        <Img
          src={
            data?.senderId === currentUser?.uid ? currentUser?.photoURL : img
          }
        />
        <Time>{date}</Time>
      </ImageWrapper>
    </Container>
  );
};

export default Message;
