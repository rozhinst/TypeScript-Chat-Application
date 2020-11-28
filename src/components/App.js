import React, { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  // const [id, setId] = useState();
  const [id, setId] = useLocalStorage('id');

  return (
    id ? <Dashboard id={ id } /> : <Login onIdSubmit={ setId } />
  )
}

export default App;