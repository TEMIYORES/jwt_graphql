import React from "react";
import { gql, useQuery } from "@apollo/react-hooks";

const App: React.FC = () => {
  const { data, loading } = useQuery(gql`
    query greeting {
      greeting
    }
  `);
  console.log(data);
  if (loading) return <span>loading...</span>;
  return (
    <>
      <h1>{JSON.stringify(data)}</h1>
    </>
  );
};

export default App;
