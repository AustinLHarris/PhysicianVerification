import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // setup state

  const fetchTickets = async() => {
    try {      
      const response = await axios.get("/api/tickets");
      setTickets(response.data);
    } catch(error) {
      setError("error retrieving tickets: " + error);
    }
  }


  // fetch ticket data
  useEffect(() => {
    fetchTickets();
  },[]);



  // render results
  return (
    <div className="App">
      {error}
      <h1>Create a Ticket</h1>
      <form onSubmit={addTicket}>
        <div>
          <label>
            Name:
            <input type="text" value={name} onChange={e => setName(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Problem:
            <textarea value={problem} onChange={e=>setProblem(e.target.value)}></textarea>
          </label>
        </div>
        <input type="submit" value="Submit" />
      </form>
      <h1>Tickets</h1>
      {tickets.map( ticket => (
        <div key={ticket.id} className="ticket">
          <div className="problem">
            <p>{ticket.problem}</p>
            <p><i>-- {ticket.name}</i></p>
          </div>
          <button onClick={e => deleteTicket(ticket)}>Delete</button>
        </div>
      ))}     
    </div>
  );
}

export default App;