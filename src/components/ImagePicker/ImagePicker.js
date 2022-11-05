import React from "react";
import { BiImageAdd } from "react-icons/bi";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;
const Icon = styled.p`
  color: #7489d9;
  font-size: 50px;
  margin: 0.4rem 0;
  cursor: pointer;
`;
const Text = styled.p`
  font-size: 15px;
  font-family: cursive;
  position: relative;
  top: -8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  max-width: 90%;
`;
const ImagePicker = ({ name, error, ...props }) => {
  return (
    <Container>
      <Icon {...props}>
        <BiImageAdd style={{ color: error && "red" }} />
      </Icon>
      <Text style={{ color: error && "red", cursor: "pointer" }} title={name}>
        {name}
      </Text>
    </Container>
  );
};

export default ImagePicker;
