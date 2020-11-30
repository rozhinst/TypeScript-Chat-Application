import React, { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import Login from './Login';
import Dashboard from './Dashboard';
import { ContactsProvider } from "../contexts/ContactsProvider";
import { ConversationsProvider } from '../contexts/ConversationsProvider';

function App() {
  // const [id, setId] = useState();
  const [id, setId] = useLocalStorage('id');
  const dashboard = (
    <ContactsProvider>
      <ConversationsProvider>
        <Dashboard id={ id } />
      </ConversationsProvider>
    </ContactsProvider>
  )

  return (
    id ? dashboard : <Login onIdSubmit={ setId } />
  )
}

export default App;