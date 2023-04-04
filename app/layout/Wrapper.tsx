import React from "react";
import { Container } from "~/primitives/Container";
import Navigation from "~/components/Navigation";

interface Props {
  children: React.ReactNode;
}

const Wrapper = ({ children }: Props) => {
  return (
    <div className="w-full bg-base-1200 px-3">
      <Container className="min-h-screen">
        <Navigation />
        {children}
      </Container>
    </div>
  );
};

export default Wrapper;
