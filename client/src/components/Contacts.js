import React from 'react';
import { useContacts } from '../contexts/ContactsProvider';
import { ListGroup } from 'react-bootstrap'

export default function Contacts() {
    const { contacts } = useContacts();
    //check duplicate username here
    return (
        <ListGroup variant="flush">
            {contacts.map(contact => (
                <ListGroup.Item key={ contact.id }>
                    { contact.name }
                </ListGroup.Item>
            )) }
        </ListGroup>

    )
}